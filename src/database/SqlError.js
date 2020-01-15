function removeBufferData(param) {
  if (param instanceof Buffer) return { type: 'buffer', data: '...too long' };
  return param;
}

export class SqlError extends Error {
  constructor(message, { params, ...props }) {
    super(message);
    Object.assign(this, props);
    this.name = 'SqlError';
    if (params != null) this.params = params.map(removeBufferData);
  }
}