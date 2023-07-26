
function getPromptModules() {
  return ['router'].map((file) => require(`./promptModules/${file}`));
};

module.exports = getPromptModules;
