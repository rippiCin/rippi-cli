class PromptModuleApi {
  constructor(creator) {
    this.creator = creator;
  }
  injectFeature(feature) {
    this.creator.featurePrompts.choices.push(feature);
  }
  injectPrompt(prompt) {
    this.creator.injectPrompts.push(prompt);
  }
  onPromptComplete(cb) {
    this.creator.promptCompleteCbs.push(cb);
  }
}

module.exports = PromptModuleApi;
