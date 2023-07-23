// child_process spawn
const spawn = require('cross-spawn');

/**
 * 执行node脚本
 * @param {any} {cwd} 脚本的工作目录
 * @param {any} script 要执行的脚本
 * @param {any} args 给脚本的参数/配置 json字符串
 * @returns {any}
 */
async function executeNodeScript({ cwd }, script, args) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      process.execPath, // node的可执行文件路径
      ["--eval", script, JSON.stringify(args)],
      { cwd, stdio: 'inherit' }, // 让子进程和父进程共享输出和错误流
    );
    childProcess.on('close', resolve);
  })
}

module.exports = executeNodeScript;
