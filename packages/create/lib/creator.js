const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const userhome = require('userhome');
const { prompt } = require('inquirer');
const { log, request, withLoading } = require('@rippiorg/utils');
const { TEMPLATES } = require('@rippiorg/settings');
const downloadGitRepo = require('download-git-repo');
const util = require('util');

class Creator {
  constructor (projectName, projectDir) {
    this.projectName = projectName;
    this.projectDir = projectDir;
    // 将downloadGitRepo转成promise
    this.downloadGitRepo = util.promisify(downloadGitRepo);
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

  async create() {
    await this.prepareProjectDir();
    // 1 选择仓库 react模板 vue模板
    // 2 选择仓库分支 react -> js/ts vue -> 2+js/2+ts/3+js/3+ts
    // 3 把标签代码下载到临时模板目录里
    // 4 把临时模板目录里的目录拷贝到当前目录中，安装依赖启动
    await this.downloadTemplate();
    await fs.copy(this.templateDir, this.projectDir);
  }
}

module.exports = Creator;
