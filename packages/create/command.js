const { executeNodeScript } = require('@rippiorg/utils');
const { COMMAND_SOURCE } = require('@rippiorg/settings');

const command = {
  command: 'create <name>',
  describe: '设置或者查看配置项',
  builder: (yargs) => {
    yargs.positional('name', {
      type: 'string',
      describe: '项目名称',
    });
  },
  handler: async function(argv) {
    // 这里开启一个子进程去执行命令，不阻塞运行
    const args = { name: argv.name, currentDirectory: process.cwd() };
    await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE, args);
  }
};

module.exports = command;