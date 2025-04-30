// import { cwd, env } from 'node:process';
//
// import meow from 'meow';
//
// import { build, TargetModule } from '#lib-builder';
//
// const cli = meow({
//   importMeta: import.meta,
//   description: 'TS libraries builder',
//   allowUnknownFlags: false,
//   flags: {
//     watch: {
//       type: 'boolean',
//       default: false,
//     },
//     module: {
//       type: 'string',
//       choices: ['esm', 'commonjs', 'dual'],
//       default: 'dual',
//     },
//     tsconfigFile: {
//       type: 'string',
//       isRequired: true,
//       default: 'tsconfig.lib.json',
//     },
//     force: {
//       type: 'boolean',
//       default: false,
//     },
//   },
// });
//
// build({
//   tsconfigFile: cli.flags.tsconfigFile,
//   initDir: env.INIT_CWD ?? cwd(),
//   targetModule: cli.flags.module as TargetModule,
// }).then(() => console.log('success'));
