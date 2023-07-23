const fs = require('fs-extra');
const chalk = require('chalk');
const { prompt } = require('inquirer');
const { log } = require('@rippiorg/utils');

class Creator {
  constructor (projectName, projectDir) {
    this.projectName = projectName;
    this.projectDir = projectDir;
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
    
  }

  async create() {
    await this.prepareProjectDir();
    // 1 选择仓库 react模板 vue模板
    // 2 选择仓库分支 react -> js/ts vue -> 2+js/2+ts/3+js/3+ts
    // 3 把标签代码下载到临时模板目录里
    // 4 把临时模板目录里的目录拷贝到当前目录中，安装依赖启动
    await this.downloadTemplate();
  }
}

module.exports = Creator;
