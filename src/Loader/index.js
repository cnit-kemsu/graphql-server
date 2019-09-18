import { BoundLoader } from './BoundLoader';

function reduceEqualKeys(keys) {
  const uniqueKeys = [];
  for (const key in keys) if (!uniqueKeys.includes(key)) uniqueKeys.push(key);
  return uniqueKeys;
}

export class Loader {

  constructor(batchLoadFn, collateFn) {
    this.load = batchLoadFn;
    this.collate = collateFn;
    this.batchLoadFn = this.batchLoadFn.bind(this);
  }

  bindToContext(context) {
    return new BoundLoader(this.batchLoadFn, context);
  }

  async batchLoadFn(keys, context, loadInfo) {

    const uniqueKeys = reduceEqualKeys(keys);
    const data = await this.load(uniqueKeys, context, loadInfo);
    return this.collate(data, keys);
  }
}