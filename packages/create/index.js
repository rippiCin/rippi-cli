const path = require('path');
const { log } = require('@rippiorg/utils');
const Creator = require('./lib/creator');
const execa = require('execa');
const getPromptModules = require('./lib/getPromptModules');

async function factory(argv) {
  // 1 创建项目目录 currentDirectory
  const { currentDirectory, name } = argv;
  // 切换工作目录为currentDirectory  因为上面传的cwd是__dirname，指向的就是这个create包的目录
  process.chdir(currentDirectory);

  const targetDir = path.join(currentDirectory, name);
  log.info('rippiorg', '准备创建的目录为%s', targetDir);
  // 插件数组
  const promptModules = getPromptModules();
  const creator = new Creator(name, targetDir, promptModules);
  await creator.create();
  const orderConfig = { cwd: targetDir, stdio: 'inherit' };
  // 启动项目
  await execa('pnpm', ['dev'], orderConfig);
};

module.exports = factory;
