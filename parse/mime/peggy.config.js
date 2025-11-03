export default {
  allowedStartRules: ['mimeType', 'essence', 'type', 'subtype', 'httpToken'],
  dts: true,
  format: 'es',
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
};
