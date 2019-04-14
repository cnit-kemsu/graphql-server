export class GraphQLError extends Error {
  constructor(message, clientInfo) {
    super(message);
    this.clientInfo = clientInfo;
    this.name = 'GraphQLError';
  }

  get info() {
    const { message, clientInfo } = this;
    return {
      message,
      ...{ clientInfo }
    };
  }
}