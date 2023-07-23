const fs = require('fs-extra');
const { log, config } = require('@rippiorg/utils');

async function factory(argv) {
  const { key, value } = argv;
  log.info('rippiorg', 'key=%s,value=%s', key, value);
  if (key && value) {
    // key和value都存在，说明是写配置
    config[key] = value;
    await fs.writeJSON(config.configPath, config, { spaces: 2 });
    log.info('rippiorg', 'key=%s,value=%s已经成功保存至%s', key, value, config.configPath);
  } else if (key) {
    // 没有value说明是查值
    log.info('rippiorg', '%s=%s', key, config[key]);
  } else {
    // 都没有就说明是查看所有的配置
    console.log(config);
  }
};

module.exports = factory;
