import { PublicError } from '../error/PublicError';
import { ClientInfo } from '../error/ClientInfo';
import { SqlError } from './SqlError';

const QUERY_ERROR_MESSAGE = /(?:\(.+?\) )(.+)(?:\nsql:.+)/;

export class Connection {
  constructor(db) {
    this.db = db;
  }

  // async query(sql, params) {
  //   try {
  //     return await this.db.query(sql, params)
  //       |> #;
  //   } catch({ message, code }) {
  //     throw new PublicError(
  //       QUERY_ERROR_MESSAGE.exec(message) |> new SqlError(#[1], { code, sql, params }),
  //       'Querying database failed',
  //       ClientInfo.UNEXPECTED_EXCEPTION
  //     );
  //   }
  // }

  async query(sql, params) {
    //console.log(sql);
    try {
      return await this.db.query(sql, params)
        |> #;
    } catch({ message, code }) {
      const msg = QUERY_ERROR_MESSAGE.exec(message);
      throw new PublicError(
        new SqlError(msg ? msg[1] : message, { code, sql, params }),
        'Querying database failed',
        ClientInfo.UNEXPECTED_EXCEPTION
      );
    }
  }

  async beginTransaction() {
    await this.db.beginTransaction();
  }
  async commit() {
    await this.db.commit();
  }
  async rollback() {
    await this.db.rollback();
  }

  end() {
    this.db.end();
  }
}