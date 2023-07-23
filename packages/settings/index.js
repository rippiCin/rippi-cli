
exports.CONFIG_NAME = '.rippiorg.json';
exports.COMMAND_SOURCE = `
const args = JSON.parse(process.argv[1]);
const factory = require('.');
factory(args);
`;