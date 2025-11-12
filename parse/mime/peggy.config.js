export default {
  allowedStartRules: [
    'mimeType',
    'essence',
    'type',
    'subtype',
    'tree',
    'subtypeName',
    'subtypeSuffix',
    'parameters',
    'parameter',
    'httpToken',
  ],
  dts: true,
  format: 'es',
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
};
