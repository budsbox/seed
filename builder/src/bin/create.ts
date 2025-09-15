import chalk from 'chalk';
import meow from 'meow';

import { isString } from '@budsbox/lib-es/guards';

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
    $ budsbox-create <archetype> <name> [--at dir] [--dry-run] [--force]

  Options
    --at       Directory under the repo root to place the workspace (defaults to archetype.at or ".")
    --dry-run  Do not write files or run commands, only print the plan
    --force    Skip confirmation prompts

  Examples
    $ budsbox-create base my-cool-lib
    $ budsbox-create ui-component Button --at ui/components
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
  const [archArg, name] = cli.input as [
    ArchetypeName | undefined,
    string | undefined,
  ];
  if (!archArg || !isString(name)) {
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
  const at = cli.flags.at;
  const force = !!cli.flags.force;
  const dryRun = !!cli.flags.dryRun;

  log.info(chalk.bold('budsbox-create starting...'));
  log.info(`  archetype: ${chalk.yellow(archetype)}`);
  log.info(`  name:      ${chalk.green(name)}`);
  if (isString(at)) log.info(`  at:        ${at}`);
  if (dryRun) log.info(chalk.gray('  dry-run:   enabled'));
  if (force) log.info(chalk.gray('  force:     enabled'));

  const plan = await makePlan({ archetypes, archetype, name, at, force });

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
