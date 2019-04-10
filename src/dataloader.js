import DataLoader from 'dataloader';
import graphqlFields from 'graphql-fields';

export class Loader {
  fields = {};

  constructor(batchLoadFn, context, keyField = 'id') {

    this.context = context;
    this.keyField = keyField;
    this.batchLoadFn = batchLoadFn.bind(this);

    this.loadFn = this.loadFn.bind(this);
    this.dataloader = new DataLoader(this.loadFn, { cache: false });
  }

  async loadFn(keys) {
    const result = await this.batchLoadFn(keys);
    const toElement = key => result.find(
      el => el[this.keyField] === key
    );
    return keys.map(toElement);
  }

  load(key, info) {
    const fields = graphqlFields(info);
    this.fields = { ...this.fields, ...fields };
    return this.dataloader.load(key);
  }

  loadMany(keys, info) {
    const fields = graphqlFields(info);
    this.fields = { ...this.fields, ...fields };
    return this.dataloader.loadMany(keys);
  }
}