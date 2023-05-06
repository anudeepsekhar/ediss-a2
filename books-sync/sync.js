import mysql from 'mysql';
import es from '@elastic/elasticsearch';

// Set environment variables for the AWS RDS MySQL database and Elasticsearch instance
const RDS_HOST = "a4-databasereplicainstance-0goerubszq2h.cxbr36apofxu.us-east-1.rds.amazonaws.com";
const RDS_PORT = 3306;
const RDS_DBNAME = "bookstore";
const RDS_USER = "ediss";
const RDS_PASSWORD = "password";

// Create Elasticsearch client
const client = new es.Client({node:"http://18.209.23.162:9200"})

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
for (let t = 0; t < 20; t++) {
  const start = Date.now();

  connection.query('SELECT * FROM books', async (error, results, fields) => {
    if (error) throw error;

    // await client.deleteByQuery({
    //     index: 'books',
    //     type: '_doc', // uncomment this line if you are using {es} ≤ 6
    //     body: {
    //         query: {
    //           match_all: {}
    //         }
    //     }
    // })

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(result.ISBN)

      await client.update({
        index: 'books',
        type: '_doc',
        id: result.ISBN,
        body: {
          doc: result,
          doc_as_upsert: true
        }
      });
    }

    console.log('All records indexed to Elasticsearch!');
  });
  await new Promise(resolve => setTimeout(resolve, 3000));
  const end = Date.now();
  console.log(`Execution time: ${end - start} ms`);
}
connection.end();