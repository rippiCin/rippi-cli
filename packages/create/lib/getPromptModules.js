
function getPromptModules() {
  return ['router', 'eslint'].map((file) => require(`./promptModules/${file}`));
};

module.exports = getPromptModules;
