import DataLoader from 'dataloader';

export class BoundLoader {

  constructor(batchLoadFn, context) {
    this.dataloader = new DataLoader(
      keys => batchLoadFn(keys, context, this.loadInfo),
      { cache: false }
    );
  }

  setLoadInfo(loadInfo) {
    if (this.loadInfo === undefined) this.loadInfo = loadInfo;
  }

  async load(key, loadInfo) {
    this.setLoadInfo(loadInfo);
    return await this.dataloader.load(key);
  }

  async loadMany(keys, loadInfo) {
    this.setLoadInfo(loadInfo);
    return await this.dataloader.loadMany(keys);
  }
}