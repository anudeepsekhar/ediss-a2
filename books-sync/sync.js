import mysql from 'mysql';
import Client from '@elastic/elasticsearch';

// Set environment variables for the AWS RDS MySQL database and Elasticsearch instance
const RDS_HOST = process.env.RDS_HOST;
const RDS_PORT = process.env.RDS_PORT;
const RDS_DBNAME = process.env.RDS_DBNAME;
const RDS_USER = process.env.RDS_USER;
const RDS_PASSWORD = process.env.RDS_PASSWORD;
const ES_HOST = process.env.ES_HOST;

// Create Elasticsearch client
const esClient = new Client({ node: ES_HOST });

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
