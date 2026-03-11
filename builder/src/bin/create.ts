import { cwd } from 'node:process';

import chalk from 'chalk';
import meow from 'meow';

import { isString } from '@budsbox/lib-es/guards';
import { joinPath, splitPath } from '@budsbox/lib-es/string';

import {
  type ArchetypeName,
  archetypes,
  executePlan,
  explainPlan,
  log,
  makePlan,
} from '#create';

const cli = meow(
  `
  Usage
    $ budsbox-create <archetype> <[sub/path/]name> [--at dir] [--dry-run] [--force]

  Options
    --at       Directory relative to the current working directory to place the workspace (defaults to archetype.at or ".")
    --dry-run  Do not write files or run commands, only print the plan
    --force    Skip confirmation prompts

  Examples
    $ budsbox-create iso-lib my-cool-lib
    $ budsbox-create ui-component ui/components/button
    $ budsbox-create ui-component button --at ui/components # equivalent to the previous example
`,
  {
    importMeta: import.meta,
    flags: {
      at: { type: 'string', isRequired: false },
      dryRun: { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
    },
  },
);

async function main(): Promise<void> {
  const [archArg, pathname] = cli.input as [
    ArchetypeName | undefined,
    string | undefined,
  ];
  if (!isString(archArg) || !isString(pathname)) {
    cli.showHelp(1);
    return;
  }

  if (!(archArg in archetypes)) {
    log.error(
      `Unknown archetype "${archArg}". Known: ${Object.keys(archetypes).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const archetype = archArg;
  const from = cwd();
  const pathNameChunks = splitPath(pathname);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const name = pathNameChunks.pop()!;
  const at = joinPath(cli.flags.at, ...pathNameChunks);
  const force = cli.flags.force;
  const dryRun = cli.flags.dryRun;

  log.info(chalk.bold('budsbox-create starting...'));
  log.info(`  archetype: ${chalk.yellow(archetype)}`);
  log.info(`  name:      ${chalk.green(name)}`);
  if (isString(at)) log.info(`  at:        ${at}`);
  if (dryRun) log.info(chalk.gray('  dry-run:   enabled'));
  if (force) log.info(chalk.gray('  force:     enabled'));

  const plan = await makePlan({
    archetype,
    archetypes,
    at: at.length > 0 ? at : undefined,
    force,
    from,
    name,
  });

  const ok = await explainPlan(plan, { prompt: !force });
  if (!ok) {
    log.warn('Aborted by user.');
    process.exitCode = 1;
    return;
  }
  await executePlan(plan, { dryRun, force });
}

main().catch((err: unknown) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
