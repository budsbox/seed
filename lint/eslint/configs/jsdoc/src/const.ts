export const exportDeclarationNodes: readonly string[] = [
  'ExportNamedDeclaration',
  'ExportDefaultDeclaration',
];

export const contextsRequireDescription: readonly string[] = [
  ...[
    'TSEnumDeclaration',
    'TSDeclareFunction',
    'TSFunctionType',
    'TSInterfaceDeclaration',
    'TSTypeAliasDeclaration',
    'TSInterfaceBody > TSPropertySignature',
    'TSInterfaceBody > TSCallSignatureDeclaration',
  ].flatMap((node) =>
    exportDeclarationNodes.map((exportNode) => `${exportNode} ${node}`),
  ),
  // jsdoc and description are required for an overloaded function declaration, but redundant for an implementation
  ...exportDeclarationNodes.map(
    (exportNode) =>
      `${exportNode}[declaration.type="FunctionDeclaration"]:not(${exportNode}[declaration.type="TSDeclareFunction"] + *)`,
  ),
];

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
