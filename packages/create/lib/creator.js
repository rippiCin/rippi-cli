const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const userhome = require('userhome');
const { prompt } = require('inquirer');
const { log, request, withLoading, loadModule, writeFileTree } = require('@rippiorg/utils');
const { TEMPLATES } = require('@rippiorg/settings');
const downloadGitRepo = require('download-git-repo');
const globSync = require('glob');
const execa = require('execa');
const util = require('util');
const glob = util.promisify(globSync);
const PromptModuleApi = require('./promptModuleApi');
const GeneratorApi = require('./generatorApi');
const { isBinaryFile } = require('isbinaryfile');

const defaultFeaturePrompt = {
  name: 'features',
  type: 'checkbox',
  message: '请选择项目的特性',
  choices: [],
};

class Creator {
  constructor (projectName, projectDir, promptModules) {
    this.projectName = projectName;
    this.projectDir = projectDir;
    // 将downloadGitRepo转成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo);
    this.promptModules = promptModules;
    // 特性的选择，之后他的choices会被一个一个插件填充
    this.featurePrompts = defaultFeaturePrompt;
    // 被注入的插件的选择框
    this.injectPrompts = [];
    // 被注入的选择完成的回调
    this.promptCompleteCbs = [];
    // 所选择的答案
    this.projectOptions = null;
    // 启用的插件
    this.plugins = [];
    // package.json的内容
    this.pkg = null;
    // 文件处理的中间件数组
    this.fileMiddleWares = [];
    // key：文件路径 value：文件内容 插件在执行过程中生成的文件都会记录在这，最后统一写入硬盘
    this.files = {};
    const promptModuleApi = new PromptModuleApi(this);
    promptModules.forEach((module) => module(promptModuleApi));
  }

  async prepareProjectDir() {
    const targetDir = this.projectDir;
    const exists = fs.existsSync(targetDir);
    if (exists) {
      const files = await fs.readdir(targetDir);
      // 文件数大于0，说明目录不为空
      if (files.length > 0) {
        const { overwrite } = await prompt({
          type: 'confirm',
          name: 'overwrite',
          message: '目标目录不为空，是否要移除已经存在的目录？',
        });
        if (overwrite) {
          await fs.emptyDir(targetDir);
        } else {
          throw new Error(chalk.red('X 结束'));
        }
      }
    } else {
      // 如果不存在就直接创建目录
      await fs.mkdirp(targetDir);
    }
    log.info('rippiorg', '%s目录已经准备就绪', targetDir);
  }

  // 下载模板
  async downloadTemplate() {
    const repos = await withLoading('加载中...', () => request.get('/orgs/rippi-cli-template/repos'));
    // 选择仓库
    const { repo } = await prompt({
      name: 'repo',
      type: 'list',
      message: '请选择框架',
      choices: repos.map((item) => item.name),
    });
    // 选择分支
    const branches = await withLoading('加载中...', () => request.get(`/repos/rippi-cli-template/${repo}/branches`));
    const { branch } = await prompt({
      name: 'branch',
      type: 'list',
      message: '请选择',
      choices: branches.filter((item) => item.name !== 'main').map((item) => item.name),
    });
    // 拼接最终的模板仓库路径
    const repository = `rippi-cli-template/${repo}/#${branch}`;
    const downloadDir = userhome(TEMPLATES);
    const templateDir = (this.templateDir = path.join(downloadDir, repo, branch));
    log.info('rippiorg', '准备下载模板到%s中', templateDir);
    // 判断下是否存在，如果存在说明不用再下载了
    const exists = fs.existsSync(templateDir);
    if (!exists) {
      await this.downloadGitRepo(repository, templateDir);
      log.info('rippiorg', '模板下载完成');
    }
  }

  // 特性选择
  async promptAndResolve() {
    const prompts = [this.featurePrompts, ...this.injectPrompts];
    const answers = await prompt(prompts);
    const projectOptions = {};
    this.promptCompleteCbs.forEach((cb) => cb(answers, projectOptions));
    return projectOptions;
  }

  // 解析和收集插件
  async resolvedPlugins(rawPlugins) {
    const plugins = [];
    for (const id of Reflect.ownKeys(rawPlugins)) {
      // 插件的generator文件是在项目的node_modules的，所以以项目的package.json为基准来require
      const apply = loadModule(`${id}/generator`, this.projectDir);
      // 插件的配置的选项{ routerMode: 'hash/history' }
      const options = rawPlugins[id];
      plugins.push({ id, apply, options });
    }
    return plugins;
  }

  // 应用插件
  async applyPlugins(plugins) {
    for (const plugin of plugins) {
      const { id, apply, options } = plugin;
      const generatorApi = new GeneratorApi(id, this, options);
      await apply(generatorApi, options);
    }
  }

  // 把当期项目中的文件全部写入到this.files中，等待被改写或者处理
  async initFiles() {
    const projectFiles = await glob('**/*', { cwd: this.projectDir, nodir: true });
    for (let i = 0; i < projectFiles.length; i++) {
      const projectFile = projectFiles[i];
      const projectFilePath = path.join(this.projectDir, projectFile);
      let content;
      if (await isBinaryFile(projectFilePath)) {
        content = await fs.readFile(projectFilePath);
      } else {
        content = await fs.readFile(projectFilePath, 'utf8');
      }
      this.files[projectFile] = content;
    }
  }

  // 执行中间件
  async renderFiles() {
    const { files, projectOptions, fileMiddleWares } = this;
    for (const middleWare of fileMiddleWares) {
      await middleWare(files, projectOptions);
    }
  }

  async create() {
    const projectOptions = (this.projectOptions = await this.promptAndResolve());
    console.log('projectOptions', projectOptions);
    await this.prepareProjectDir();
    // 1 选择仓库 react模板 vue模板
    // 2 选择仓库分支 react -> js/ts vue -> 2+js/2+ts/3+js/3+ts
    // 3 把标签代码下载到临时模板目录里
    // 4 把临时模板目录里的目录拷贝到当前目录中，安装依赖启动
    await this.downloadTemplate();
    await fs.copy(this.templateDir, this.projectDir);
    // 读取package.json的内容
    const pkgPath = path.join(this.projectDir, 'package.json');
    const pkg = (this.pkg = await fs.readJSON(pkgPath));
    // 修改当前项目中的package.json的开发依赖，添加插件的依赖
    const pluginDeps = Reflect.ownKeys(projectOptions.plugins);
    pluginDeps.forEach((dep) => pkg.devDependencies[dep] = 'latest');
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
    // 初始化git仓库
    const orderConfig = { cwd: this.projectDir, stdio: 'inherit' };
    await execa('git', ['init'], orderConfig);
    // 安装依赖
    await execa('pnpm', ['install'], orderConfig);
    // 找到插件
    const resolvedPlugins = await this.resolvedPlugins(projectOptions.plugins);
    // 执行插件
    await this.applyPlugins(resolvedPlugins);
    // 初始化files对象
    await this.initFiles();
    // 开始调用中间件处理文件 this.files
    await this.renderFiles();
    // 删除插件依赖，因为插件依赖只有在生成项目的时候需要，项目本身是不需要的
    pluginDeps.forEach((dep) => delete pkg.devDependencies[dep]);
    this.files['package.json'] = JSON.stringify(pkg, null, 2);
    // 把files写入项目目录
    await writeFileTree(this.projectDir, this.files);
    await execa('pnpm', ['install'], orderConfig);
  }
}

module.exports = Creator;
