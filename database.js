const mysql = require('mysql');

const config = {
  host: 'sql.mit.edu',
  user: 'vcvos52',
  password: 'jut22yow',
  database: 'vcvos52+fritter',
};

class Database {
  constructor(dbConfig) {
    this.connection = mysql.createPool(dbConfig);
  }

  query(sql, attr) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, attr, (err, rows) => {
        if (err) { return reject(err); }
        resolve(rows);
      });
    });
  }

  // This is a helper function to close a connection to the database.
  // The connection also closes when the program stops running.
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) { return reject( err ); }
        resolve();
      });
    });
  }

  async createTables() {
    return;
  }

  /* Used for testing */
  async clearTables() {
    await database.query('TRUNCATE TABLE vote');
    await database.query('TRUNCATE TABLE freets');
    await database.query('TRUNCATE TABLE users');
    await database.query('TRUNCATE TABLE id');
    await database.query('INSERT INTO id (id) VALUES (0)');

  }
}

const database = new Database(config);

module.exports = database;
