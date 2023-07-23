const userhome = require('userhome');
const fs = require('fs-extra');
const { CONFIG_NAME } = require('@rippiorg/settings');
// 拼接出用户根目录下的CONFIG_NAME的路径
const configPath = userhome(CONFIG_NAME);

let config = {};
// 判断是否有这个配置文件
if (fs.existsSync(configPath)) {
  config = fs.readJSONSync(configPath);
}

config.configPath = configPath;
module.exports = config;