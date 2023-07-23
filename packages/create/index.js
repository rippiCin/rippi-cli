const fs = require('fs-extra');
const path = require('path');
const { log, config } = require('@rippiorg/utils');
const chalk = require('chalk');
const { prompt } = require('inquirer');

async function factory(argv) {
  // 1 创建项目目录 currentDirectory
  const { currentDirectory, name } = argv;
  // 切换工作目录为currentDirectory  因为上面传的cwd是__dirname，指向的就是这个create包的目录
  process.chdir(currentDirectory);

  const targetDir = path.join(currentDirectory, name);
  log.info('rippiorg', '准备创建的目录为%s', targetDir);
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
};

module.exports = factory;
