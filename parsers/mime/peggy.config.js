export default {
  allowedStartRules: ['mimeType', 'essence', 'type', 'subtype', 'httpToken'],
  dependencies: {},
  dts: true,
  format: 'es',
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
};
