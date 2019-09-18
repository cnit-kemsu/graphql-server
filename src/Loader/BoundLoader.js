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

  load(key, loadInfo) {
    this.setLoadInfo(loadInfo);
    return this.dataloader.load(key);
  }

  loadMany(keys, loadInfo) {
    this.setLoadInfo(loadInfo);
    return this.dataloader.loadMany(keys);
  }
}