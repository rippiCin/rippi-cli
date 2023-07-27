const fs = require('fs-extra');
const path = require('path');
function writeFileTree(projectDir, files) {
  Object.keys(files).forEach((file) => {
    const content = files[file];
    if (file.endsWith('.ejs')) file = file.slice(0, -4);
    const filePath = path.join(projectDir, file);
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, content);
  })
}

module.exports = writeFileTree;
