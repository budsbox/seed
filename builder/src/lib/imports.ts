// import { relative } from 'node:path/posix';
//
// import {
//   isArray,
//   isNil,
//   isObject,
//   isString,
// } from '@budsbox/iso-utils/type-guards';
//
// // eslint-disable-next-line @typescript-eslint/no-empty-object-type
// interface Imports
//   extends Readonly<
//     Record<string, string | ReadonlyArray<string | Imports> | Imports>
//   > {}
//
// export const mapImports = ({
//   imports,
//   rootDir,
// }: {
//   readonly imports: Imports | undefined;
//   readonly rootDir: string;
// }): Imports | undefined => {
//   if (isNil(imports)) return imports;
//
//   const processString = (value: string): string =>
//     value.startsWith(rootDir) || value.startsWith(`./${rootDir}`) ?
//       `./${relative(rootDir, value)}`
//     : value;
//
//   const process = (subImports: Imports): Imports =>
//     Object.fromEntries(
//       Object.entries(subImports).map(([key, value]) => {
//         if (isString(value)) {
//           return [key, processString(value)];
//         } else if (isArray(value)) {
//           return [
//             key,
//             value.map((v) => (isString(v) ? processString(v) : process(v))),
//           ];
//         } else if (isObject(value)) {
//           return [key, process(value)];
//         }
//         return [key, value] as never;
//       }),
//     ) as Imports;
//
//   return process(imports);
// };
