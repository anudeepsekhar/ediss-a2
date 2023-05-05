import mysql from 'mysql';
import es from '@elastic/elasticsearch';

// Set environment variables for the AWS RDS MySQL database and Elasticsearch instance
const RDS_HOST = "a3-databaseprimaryinstance-1xqclmtdy8r5.cdzfxmkoehy9.us-east-1.rds.amazonaws.com";
const RDS_PORT = 3306;
const RDS_DBNAME = "bookstore";
const RDS_USER = "ediss";
const RDS_PASSWORD = "password";

// Create Elasticsearch client
const client = new es.Client({node:"http://54.91.113.5:9200"})

// Create MySQL connection
const connection = mysql.createConnection({
    host: RDS_HOST,
    port: RDS_PORT,
    database: RDS_DBNAME,
    user: RDS_USER,
    password: RDS_PASSWORD
});



connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

// Use the connection object to execute queries
connection.query('SELECT * FROM books', async (error, results, fields) => {
  if (error) throw error;

  // Loop over the results and index each one to Elasticsearch
  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    // Index the result to Elasticsearch
    await client.index({
      index: 'books',
      type: '_doc',
      body: result
    });
  }

  console.log('All records indexed to Elasticsearch!');
});

// Don't forget to close the connection when you're done
connection.end();