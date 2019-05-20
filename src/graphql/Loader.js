import DataLoader from 'dataloader';

export const collate = {
  find(keyProp) {
    return function (array, keys) {
      return keys.map(
        key => array.find(
          row => row[keyProp] === key
        )
      );
    }
  },
  filter(keyProp) {
    return function (array, keys) {
      return keys.map(
        key => array.filter(
          row => row[keyProp] === key
        )
      );
    }
  }
}

function excludeEqual(keys, key) {
  if (!keys.includes(key)) keys.push(key);
  return keys;
}

class BoundLoader {

  constructor(batchLoadFn, context) {
    this.dataloader = new DataLoader(
      keys => batchLoadFn(keys, context, this.resolveInfo),
      { cache: false }
    );
  }

  load(key, resolveInfo) {
    this.resolveInfo = resolveInfo;
    return this.dataloader.load(key);
  }

  loadMany(keys, resolveInfo) {
    this.resolveInfo = resolveInfo;
    return this.dataloader.loadMany(keys);
  }
}

export class Loader {

  constructor(batchLoadFn, collation = collate.find('id')) {
    this.load = batchLoadFn;
    this.collation = collation;
    this.batchLoadFn = this.batchLoadFn.bind(this);
  }

  bind(context) {
    return new BoundLoader(this.batchLoadFn, context);
  }

  async batchLoadFn(keys, context, resolveInfo) {

    return keys.reduce(excludeEqual, [])
    |> await this.load(#, context, resolveInfo)
    |> this.collation(#, keys);
  }
}