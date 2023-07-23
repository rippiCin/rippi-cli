#! /usr/bin/env node

const yargs = require('yargs/yargs');
const configCmd = require('@rippiorg/config/command');
const createCmd = require('@rippiorg/create/command');
const main = async () => {
  const cli = yargs();
  cli
    .usage('usage rippiorg <command> [options]')
    .demandCommand(1, '至少需要一个命令')
    .strict()
    .recommendCommands()
    .command(configCmd)
    .command(createCmd)
    .parse(process.argv.slice(2));
};

main().catch(console.log);