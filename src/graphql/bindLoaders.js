export function bindLoaders(loaders, context) {
  for (const [name, loader] of Object.entries(loaders)) {
    context[name] = loader.bind(context);
  }
}