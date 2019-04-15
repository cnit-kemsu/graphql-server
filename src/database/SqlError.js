export class SqlError extends Error {
  constructor(message, props) {
    super(message);
    Object.assign(this, props);
    this.name = 'SqlError';
  }
}