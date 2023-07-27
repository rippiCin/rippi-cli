const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const { extractCallDir, mergeDeps, isObject, isString } = require('@rippiorg/utils');
const { render } = require('ejs');
const fs = require('fs-extra');
const { isBinaryFile } = require('isbinaryfile');

class GeneratorApi {
  constructor(id, creator, options) {
    this.id = id;
    this.creator = creator;
    this.options = options;
  }
  async _injectFileMiddleWare(middleWare) {
    this.creator.fileMiddleWares.push(middleWare);
  }
  // 把模板进行渲染并输出到项目中
  render(templateDir) {
    const execDir = extractCallDir();
    if (isString(templateDir)) {
      templateDir = path.resolve(execDir, templateDir);
      this._injectFileMiddleWare(async (files, projectOptions) => {
        // 拿到该文件夹下的所有文件
        const templateFiles = await glob('**/*', { cwd: templateDir, nodir: true });
        for (let i = 0; i < templateFiles; i++) {
          let templateFile = templateFiles[i];
          // 给creator的files赋值
          files[templateFile] = await renderFile(path.resolve(templateDir, templateFile, projectOptions));
        }
      })
    }
  }
  // 添加依赖包
  extendPackage(toMerge) {
    const pkg = this.creator.pkg;
    for (const key in toMerge) {
      const value = toMerge[key];
      const exist = pkg[key];
      if (isObject(value) && (key === 'dependencies' || key === 'devDependencies')) {
        pkg[key] = mergeDeps(exist || {}, value);
      } else {
        pkg[key] = value;
      }
    }
  }
  // 插入import语句
  injectImport() {

  }
  // 转换脚本
  transformScript() {

  }
}

async function renderFile(templatePath, projectOptions) {
  // 如果是二进制文件的话直接返回buffer
  if (await isBinaryFile(templatePath)) {
    return await fs.rendFile(templatePath);
  }
  const template = await fs.readFile(templatePath, 'utf8');
  return render(template, projectOptions);
}

module.exports = GeneratorApi;
