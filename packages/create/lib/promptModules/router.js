
module.exports = (cli) => {
  // 注入特性
  cli.injectFeature({
    name: 'Router',
    value: 'router',
    description: '是否支持路由',
  });
  // 弹出选项，决定路由模式
  cli.injectPrompt({
    name: 'routerMode',
    when: (answers) => answers.features.includes('router'),
    type: 'list',
    choices: [
      { name: 'hash', value: 'hash' },
      { name: 'history', value: 'history' },
    ],
    default: 'history',
  });
  // 选完路由模式后的回调
  cli.onPromptComplete((answers, projectOptions) => {
    if (answers.features.includes('router')) {
      projectOptions.routerMode = answers.routerMode;
    }
  })
};
