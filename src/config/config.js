const mysql = require('mysql');

let adminPool, studentPool;

try {
  adminPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'IHxalb#2',
    database: 'adminDB'
  });

  adminPool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to Admin database:', err.stack);
      return;
    }
    console.log('Connected to Admin database.');
    connection.release();
  });

  studentPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'IHxalb#2',
    database: 'studentDB'
  });

  studentPool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to Student database:', err.stack);
      return;
    }
    console.log('Connected to Student database.');
    connection.release();
  });

} catch (error) {
  console.error('Database connection error:', error.message);
  process.exit(1);
}

module.exports = { adminPool, studentPool };
