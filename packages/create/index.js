const path = require('path');
const { log } = require('@rippiorg/utils');
const Creator = require('./lib/creator');
const execa = require('execa');

async function factory(argv) {
  // 1 创建项目目录 currentDirectory
  const { currentDirectory, name } = argv;
  // 切换工作目录为currentDirectory  因为上面传的cwd是__dirname，指向的就是这个create包的目录
  process.chdir(currentDirectory);

  const targetDir = path.join(currentDirectory, name);
  log.info('rippiorg', '准备创建的目录为%s', targetDir);
  const creator = new Creator(name, targetDir);
  await creator.create();
  const orderConfig = { cwd: targetDir, stdio: 'inherit' };
  // 初始化git仓库
  await execa('git', ['init'], orderConfig);
  // 安装依赖
  await execa('pnpm', ['install'], orderConfig);
  // 启动项目
  await execa('pnpm', ['dev'], orderConfig);
};

module.exports = factory;
