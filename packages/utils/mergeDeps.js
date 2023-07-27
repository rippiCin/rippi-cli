function mergeDeps(sourceDeps, depsToInject) {
  const result = Object.assign({}, sourceDeps);
  for (const key in depsToInject) {
    result[key] = depsToInject[key];
  }
  return result
}

module.exports = mergeDeps;
