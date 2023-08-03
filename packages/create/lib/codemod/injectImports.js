function injectImports(fileInfo, api, { imports }) {
  const jscodeshift = api.jscodeshift;
  const astRoot = jscodeshift(fileInfo.source);
  const declarations = astRoot.find(jscodeshift.ImportDeclaration);
  // 存放这语法中所有的import语句
  const toImportAstNode = (imp) => jscodeshift(`${imp}\n`).nodes()[0].program.body[0];
  const importAstNodes = imports.map(toImportAstNode);
  // import 只能放在最顶端，所以如果当前有import语句就紧随这些import语句，无就放在首行
  if (declarations.length > 0) {
    declarations.at(-1).insertAfter(importAstNodes);
  } else {
    astRoot.get().node.program.body.unshift(...importAstNodes);
  }
  return astRoot.toSource();
}

module.exports = injectImports;
