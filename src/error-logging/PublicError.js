export class PublicError extends Error {

  constructor(...args) {
    if (typeof args[0] === 'string') {
      super(args[0]);
      this.clientInfo = args[1] || null;
    } else {
      super(args[1]);
      this.clientInfo = args[2] || null;
      this.originalError = args[0] || null;
    }
    this.name = 'PublicError';
  }
}