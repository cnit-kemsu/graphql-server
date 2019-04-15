import mariadb from 'mariadb';
import { PublicError } from '../error/PublicError';
import { ClientInfo } from '../error/ClientInfo';
import { Connection } from './Connection';
import { SqlError } from './SqlError';

const CONNECTION_ERROR_MESSAGE = /(?:\(.+?\) )(.+)/;

export class Pool {
  constructor(config) {
    this.pool = mariadb.createPool(config);
  }

  async getConnection() {
    try {
      return await this.pool.getConnection()
        |> new Connection(#);
    } catch({ message }) {
      throw new PublicError(
        CONNECTION_ERROR_MESSAGE.exec(message) |> new SqlError(#[1]),
        'Database connection failed',
        ClientInfo.TECHNICAL_ISSUE
      );
    }
  }
}