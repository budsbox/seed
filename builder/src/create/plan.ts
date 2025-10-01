import type { Undef } from '@budsbox/lib-types';

import type {
  ArchetypeMap,
  ArchetypeName,
  Command,
  Plan,
  PlannedFile,
  ResolvedCommand,
} from './types.js';

import { promises as fs } from 'node:fs';
import { join, matchesGlob, relative } from 'node:path';

import * as prompts from '@clack/prompts';
import chalk from 'chalk';

import { isFalse, isString, isTrue } from '@budsbox/lib-es/guards';
import { sure } from '@budsbox/lib-es/logical';
import {
  clampWS,
  formatPackageName,
  joinPath,
  resolvePackageName,
} from '@budsbox/lib-es/string';
import { getRootWorkspace, tryWorkspaceByFilepath } from '@budsbox/lib-yarn';

import {
  ensureDirVerbose,
  log,
  mergeManifests,
  pathExists,
  resolveArchetype,
  resolveCommand,
  runCommandVerbose,
  writeFileVerbose,
} from './lib.js';

/**
 * Build a complete, side-effect-free plan to create a workspace.
 * The plan includes the target directory, files to write, which files would be overwritten,
 * and the exact commands that will be run (with their working directories).
 *
 * @param opts - Options for the plan
 * @param opts.archetype - Archetype name to use
 * @param opts.name - New workspace name (also used for directory name)
 * @param opts.at - Optional base directory under repo root; defaults to archetype.at or "."
 * @param opts.force - When true, skip the existing-workspace confirm prompt
 * @returns The assembled plan
 */
export async function makePlan({
  archetypes,
  archetype,
  name,
  from,
  at,
  force = false,
}: Readonly<{
  archetypes: ArchetypeMap;
  archetype: ArchetypeName;
  name: string;
  from: string;
  at?: Undef<string>;
  force?: boolean;
}>): Promise<Plan> {
  const resolvedArchetype = resolveArchetype(archetypes, archetype);
  const root = getRootWorkspace();
  const rootIdent = resolvePackageName(root.manifest.name ?? '');
  const rootCwd = root.cwd;
  const targetBase = join(from, at ?? resolvedArchetype.at);
  const cwd = join(targetBase, name);

  const wsOwnsCwd = tryWorkspaceByFilepath(join(cwd, 'package.json')) ?? root;
  const alreadyExists = wsOwnsCwd.cwd === cwd;
  if (alreadyExists && !force) {
    const cont = await prompts.confirm({
      message: `Workspace already exists at ${relative(from, cwd)}. Create another one here anyway?`,
      initialValue: false,
    });
    if (!isTrue(cont))
      throw new Error('Aborted: workspace exists at target location.');
  }

  const parentWs =
    alreadyExists ? tryWorkspaceByFilepath(join(cwd, '..')) ?? root : wsOwnsCwd;
  const parentIdent = resolvePackageName(parentWs.manifest.name ?? '');

  const ident = formatPackageName(name, {
    root: rootIdent,
    parent: parentIdent,
    relCwd: relative(parentWs.cwd, cwd),
  });

  const willCreateDir = isFalse(await pathExists(cwd));

  // Compose package.json
  const pkgManifest = mergeManifests(
    {
      name: ident,
      license: root.manifest.license,
    },
    resolvedArchetype.manifest,
  );
  const pkgJsonContent = `${JSON.stringify(pkgManifest, null, 2)}\n`;

  let licenseContent: string | null = null;

  try {
    licenseContent = await fs.readFile(join(rootCwd, 'LICENSE'), 'utf-8');
  } catch {
    // no license lol
  }

  // Files to write: package.json first, then templates
  const files: PlannedFile[] = await Promise.all(
    [
      {
        path: join(cwd, 'package.json'),
        content: pkgJsonContent,
      } as const,
      {
        path: join(cwd, 'README.md'),
        content: `# ${ident}\n`,
      },
      ...sure(
        licenseContent,
        (content) => [{ path: join(cwd, 'LICENSE'), content } as const],
        [],
      ),
      ...Object.entries(resolvedArchetype.files).map(
        ([path, content]) => ({ path: join(cwd, path), content }) as const,
      ),
    ].map(
      async ({ path, content }): Promise<PlannedFile> => ({
        path,
        content,
        isOverwrite: await pathExists(path),
      }),
    ),
  );

  const resolveCmd = (cmd: Readonly<Command>): ResolvedCommand =>
    resolveCommand(cmd, {
      workspace: ident,
      cwd: cwd,
    });

  const installEnv = {
    YARN_ENABLE_CONSTRAINTS_CHECKS: 'false',
    YARN_PREFER_INTERACTIVE: 'false',
  };

  const commands: ResolvedCommand[] = [];

  const parentWorkspacesGlobs = parentWs.manifest.workspaceDefinitions.map(
    ({ pattern }) => pattern,
  );
  if (
    !parentWorkspacesGlobs.some((glob) =>
      matchesGlob(cwd, join(parentWs.cwd, glob)),
    )
  ) {
    const newGlob = await prompts.select<string | false>({
      message: clampWS(
        `The new workspace path doesn't match any glob pattern in ${parentIdent}'s "workspaces" field.
        Which glob pattern should be added?`,
      ),
      options: [
        ...['*', name]
          .map((base) =>
            joinPath('.', relative(parentWs.cwd, targetBase), base),
          )
          // .map((base) => `./${join(relative(parentWs.cwd, targetBase), base)}`)
          .map((pattern) => ({
            value: pattern,
            label: JSON.stringify(pattern),
          })),
        {
          value: false,
          label: '<abort>',
        },
      ],
    });
    if (!isString(newGlob)) throw new Error('Aborted: no glob selected.');

    commands.push(
      resolveCmd({
        workspace: parentIdent,
        exec: `npm pkg set 'workspaces[]=${newGlob}'`,
      }),
    );
  }
  // yarn install in root
  commands.push(
    resolveCmd({
      workspace: 'root',
      exec: 'yarn install',
      options: { env: installEnv },
    }),
  );
  // install deps in the new workspace
  if (resolvedArchetype.dependencies.length > 0) {
    commands.push(
      resolveCmd({
        exec: `yarn add ${resolvedArchetype.dependencies.join(' ')}`,
        options: { env: installEnv },
      }),
    );
  }
  if (resolvedArchetype.devDependencies.length > 0) {
    commands.push(
      resolveCmd({
        exec: `yarn add -D ${resolvedArchetype.devDependencies.join(' ')}`,
        options: { env: installEnv },
      }),
    );
  }
  if (resolvedArchetype.peerDependencies.length > 0) {
    const peers = resolvedArchetype.peerDependencies.join(' ');
    commands.push(
      resolveCmd({
        exec: `yarn remove ${peers} || exit 0`,
        options: { env: installEnv },
      }),
      resolveCmd({
        exec: `yarn add -P ${resolvedArchetype.peerDependencies.join(' ')}`,
        options: { env: installEnv },
      }),
    );
  }
  // constraints + second install in root
  commands.push(
    resolveCmd({ exec: 'yarn constraints --fix', workspace: 'root' }),
  );
  commands.push(
    resolveCmd({
      exec: 'yarn install',
      workspace: 'root',
      options: { env: installEnv },
    }),
  );

  commands.push(...resolvedArchetype.commands.map(resolveCmd));

  return {
    archetype,
    name,
    ident,
    at: targetBase,
    cwd,
    willCreateCwd: willCreateDir,
    files,
    commands,
  };
}

/**
 * Explains a plan and optionally prompts the user to confirm it.
 * The method logs details about the plan such as workspace, archetype,
 * directory creation, files to be written or overwritten, and commands to be executed.
 *
 * @param plan - A readonly object containing the plan details, including workspace name, archetype,
 * files to be processed, and commands to be run.
 * @param param1 - An optional object containing additional options.
 * @param param1.prompt - A boolean indicating whether to prompt the user for confirmation (default: true).
 * @returns A promise that resolves to a boolean indicating whether the plan was confirmed (true) or aborted (false).
 */
export async function explainPlan(
  plan: Readonly<Plan>,
  { prompt = true } = {},
): Promise<boolean> {
  const rel = (p: string): string => relative(process.cwd(), p) || '.';
  log.info(
    `${chalk.bold('Plan')}: create workspace "${chalk.green(plan.ident)}" from archetype "${chalk.yellow(plan.archetype)}"`,
  );
  log.info(
    `  cwd: ${rel(plan.cwd)} ${chalk.gray(`(base "${rel(plan.at)}")`)} (${plan.willCreateCwd ? chalk.green('will be created') : chalk.yellow('already exists')}) `,
  );
  const toOverwrite = plan.files.filter((f) => f.isOverwrite).length;
  if (plan.files.length) {
    log.info(
      `  write ${plan.files.length.toFixed(0)} file(s) ${toOverwrite > 0 ? chalk.red(`(${toOverwrite.toFixed(0)} overwrite)`) : ''}:`,
    );
    for (const file of plan.files) {
      const marker =
        file.isOverwrite ? chalk.red('overwrite') : chalk.green('create');
      log.info(`    - ${marker} ${rel(file.path)}`);
    }
  } else {
    log.info('  write files: none');
  }
  log.info('  run commands:');
  for (const cmd of plan.commands)
    log.info(
      `    - at ${chalk[cmd.workspace === plan.ident ? 'gray' : 'yellow'](cmd.workspace)}: ${cmd.exec}`,
    );

  if (!prompt) return true;
  const proceed = await prompts.confirm({
    message: 'Proceed with this plan?',
    initialValue: true,
  });
  return isTrue(proceed);
}

/**
 * Execute the plan. Prompts per-file if an overwriting occurs unless `force` is set.
 * Respects `dryRun` by only printing the operations without making changes.
 *
 * @param plan - The plan created by makePlan
 * @param options - Options for execution
 * @param options.dryRun - Do not change filesystem or run commands when true
 * @param options.force - Skip prompts when true
 */
export async function executePlan(
  plan: Readonly<Plan>,
  { dryRun = false, force = false } = {},
): Promise<void> {
  if (dryRun) log.info(chalk.gray('dry-run: no changes will be made'));

  // 1) create directory
  if (plan.willCreateCwd) await ensureDirVerbose(plan.cwd, { dryRun });

  // 2) write files with a per-file overwrite prompt
  for (const file of plan.files) {
    const exists = await pathExists(file.path);
    if (exists && !force) {
      const ok = await prompts.confirm({
        message: `File exists and will be overwritten: ${relative(process.cwd(), file.path)}. Continue?`,
        initialValue: false,
      });
      if (!isTrue(ok)) {
        log.warn(`skipped ${relative(process.cwd(), file.path)}`);
        continue;
      }
    }
    await writeFileVerbose(file.path, file.content, { dryRun });
  }

  // 3) run commands in order
  for (const cmd of plan.commands) {
    await runCommandVerbose(cmd, { dryRun });
  }

  log.success('Done.');
}
