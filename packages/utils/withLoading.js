async function withLoading(msg, fn, ...args) {
  const ora = await import('ora');
  const spinner = ora.default(msg);
  spinner.start();
  const result = await fn(...args);
  spinner.succeed();
  return result;
}

module.exports = withLoading;
