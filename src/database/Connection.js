import { PublicError } from '../error/PublicError';
import { ClientInfo } from '../error/ClientInfo';
import { SqlError } from './SqlError';

const QUERY_ERROR_MESSAGE = /(?:\(.+?\) )(.+)(?:\nsql:.+)/;

export class Connection {
  constructor(db) {
    this.db = db;
  }

  async query(sql, params) {
    try {
      return await this.db.query(sql, params)
        |> #;
    } catch({ message, code }) {
      throw new PublicError(
        QUERY_ERROR_MESSAGE.exec(message) |> new SqlError(#[1], { code, sql, params }),
        'Querying database failed',
        ClientInfo.UNEXPECTED_EXCEPTION
      );
    }
  }

  end() {
    this.db.end();
  }
}