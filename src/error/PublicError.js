export class PublicError extends Error {

  constructor(...args) {
    if (typeof args[0] === 'string') {
      super(args[0]);
      if (args[1] !== undefined) this.clientInfo = args[1];
      if (args[2] !== undefined) Object.assign(this, args[2]);
    } else {
      super(args[1]);
      if (args[2] !== undefined) this.clientInfo = args[2];
      if (args[0] !== undefined) this.rootCause = args[0];
      if (args[3] !== undefined) Object.assign(this, args[3]);
    }
    this.name = 'PublicError';
  }
}
