const path = require('path');
const Module = require('module');
function loadModule(request, contextDir) {
  return Module.createRequire(path.resolve(contextDir, 'package.json'))(request);
}

module.exports = loadModule;
