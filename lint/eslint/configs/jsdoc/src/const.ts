export const exportDeclarationNodes: readonly string[] = [
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
];

export const contextsRequireDescription: readonly string[] = [
  ...[
    'TSEnumDeclaration',
    'TSDeclareFunction',
    'TSFunctionType:not(TSFunctionType TSFunctionType)',
    'TSInterfaceDeclaration',
    'TSTypeAliasDeclaration',
    'TSInterfaceBody > TSPropertySignature',
    'TSInterfaceBody > TSCallSignatureDeclaration',
  ].flatMap((node) =>
    exportDeclarationNodes.map((exportNode) => `${exportNode}:has(> ${node})`),
  ),
  // jsdoc and description are required for an overloaded function declaration, but redundant for an implementation.
  // so this rule checks there's no preceeded declaration (which would mean it's an implementation)
  ...exportDeclarationNodes.map(
    (exportNode) =>
      `${exportNode}[declaration.type="FunctionDeclaration"]:not(${exportNode}[declaration.type="TSDeclareFunction"] + *)`,
  ),
];
// ExportNamedDeclaration[declaration.type="FunctionDeclaration"]:not(ExportNamedDeclaration[declaration.type="TSDeclareFunction"] + *)

export const contextsRequireParam: readonly string[] = [
  ...[
    'TSFunctionType',
    'ArrowFunctionExpression',
    'FunctionDeclaration',
    'FunctionExpression',
    'TSDeclareFunction',
    'TSEmptyBodyFunctionExpression',
    'TSCallSignatureDeclaration',
    'TSMethodSignature',
  ].flatMap((node) =>
    exportDeclarationNodes.map((exportNode) => `${exportNode} ${node}`),
  ),
];
