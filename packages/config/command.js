const { executeNodeScript } = require('@rippiorg/utils');
const { COMMAND_SOURCE } = require('@rippiorg/settings');

const command = {
  command: 'config [key] [value]',
  describe: '设置或者查看配置项',
  // builder: (yargs) => {
  // },
  handler: async function(argv) {
    // 这里开启一个子进程去执行命令，不阻塞运行
    await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE, argv);
  }
};

module.exports = command;