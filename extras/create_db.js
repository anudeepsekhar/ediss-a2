const mysql = require('mysql');

// Set up MySQL connection pool with RDS writer endpoint
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'a3-databasereplicainstance-towmnpstiycy.cdzfxmkoehy9.us-east-1.rds.amazonaws.com',
  user: 'ediss',
  password: 'password',
//   database: 'your-default-db-name'
});

// Function to create a new MySQL database
const createDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    // Create a new MySQL connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection:', err);
        reject(err);
        return;
      }

      // Execute SQL statement to create new database
      connection.query(`CREATE DATABASE ${dbName}`, (error, results, fields) => {
        // Release the MySQL connection back to the pool
        connection.release();
        if (error) {
          console.error(`Error creating database ${dbName}:`, error);
          reject(error);
          return;
        }
        console.log(`Created database ${dbName}`);
        resolve(results);
      });
    });
  });
};

// Usage: create a new MySQL database called "bookstore"
createDatabase('bookstore')
  .then(() => console.log('Done'))
  .catch(error => console.error('Error:', error));