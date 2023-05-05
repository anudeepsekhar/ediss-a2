import mysql from 'mysql';
import es from '@elastic/elasticsearch';

// Set environment variables for the AWS RDS MySQL database and Elasticsearch instance
const RDS_HOST = "a3-databaseprimaryinstance-1xqclmtdy8r5.cdzfxmkoehy9.us-east-1.rds.amazonaws.com";
const RDS_PORT = 3306;
const RDS_DBNAME = "bookstore";
const RDS_USER = "ediss";
const RDS_PASSWORD = "password";
const ES_HOST = "http://34.224.8.168:9200";

// Create Elasticsearch client
const esClient = new es.Client({ node: ES_HOST });

// Create MySQL connection
const connection = mysql.createConnection({
    host: RDS_HOST,
    port: RDS_PORT,
    database: RDS_DBNAME,
    user: RDS_USER,
    password: RDS_PASSWORD
});

// Define MySQL query to retrieve data
const query = 'SELECT * FROM books';

// Execute query and fetch results
connection.query(query, function (error, results, fields) {
    if (error) throw error;

    // Create Elasticsearch index
    const indexName = 'books';
    esClient.indices.create({ index: indexName }).catch(err => console.error(err));

    // Create list of Elasticsearch documents to index
    const documents = results.map(row => ({
        index: {
            _index: indexName,
            _id: row.id
        }
    }));
    results.forEach((row, i) => documents[i].body = row);

    // Index documents in Elasticsearch
    esClient.bulk({ body: documents }).catch(err => console.error(err));

    // Close MySQL connection
    connection.end();
});
