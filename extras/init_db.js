import mysql from "mysql"

const AWS_RDS_HOST = "a3-databasereplicainstance-towmnpstiycy.cdzfxmkoehy9.us-east-1.rds.amazonaws.com"

const connection = mysql.createConnection({
  host     : AWS_RDS_HOST,
  user     : "ediss",
  password : "password",
  port     : 3306,
});

connection.connect((error) => {
  if (error) {
    throw error;
  }
  console.log('Connected to MySQL server');

  // check if the database exists
  connection.query('SHOW DATABASES LIKE "bookstore"', (error, results) => {
    if (error) {
      throw error;
    }
    if (results.length === 0) {
      // create the database and table
      connection.query('CREATE DATABASE bookstore', (error) => {
        if (error) {
          throw error;
        }
        console.log('Created database "bookstore"');
        const q2 = "CREATE TABLE `books` (`ISBN` varchar(20) COLLATE ascii_bin NOT NULL,\
                  `title` varchar(45) COLLATE ascii_bin NOT NULL,\
                  `Author` varchar(45) COLLATE ascii_bin NOT NULL,\
                  `description` varchar(255) COLLATE ascii_bin NOT NULL,\
                  `genre` varchar(45) COLLATE ascii_bin NOT NULL,\
                  `price` decimal(9,2) DEFAULT NULL,\
                  `quantity` int NOT NULL,\
                  PRIMARY KEY (`ISBN`),\
                  UNIQUE KEY `ISBN` (`ISBN`)\
                  ) ENGINE=InnoDB DEFAULT CHARSET=ascii COLLATE=ascii_bin;"
        connection.query(q2, (error) => {
          if (error) {
            throw error;
          }
          console.log('Created table "books"');
          connection.end();
        });
        const q3 = "CREATE TABLE `customers` (\
          `id` int NOT NULL AUTO_INCREMENT,\
          `userId` varchar(80) COLLATE ascii_bin NOT NULL,\
          `name` varchar(100) COLLATE ascii_bin NOT NULL,\
          `phone` varchar(45) COLLATE ascii_bin NOT NULL,\
          `address` varchar(45) COLLATE ascii_bin NOT NULL,\
          `address2` varchar(45) COLLATE ascii_bin DEFAULT NULL,\
          `city` varchar(45) COLLATE ascii_bin NOT NULL,\
          `state` varchar(45) COLLATE ascii_bin NOT NULL,\
          `zipcode` varchar(45) COLLATE ascii_bin NOT NULL,\
          PRIMARY KEY (`id`),\
          UNIQUE KEY `is_UNIQUE` (`id`),\
          UNIQUE KEY `userId_UNIQUE` (`userId`),\
          UNIQUE KEY `userId` (`userId`)\
        ) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=ascii COLLATE=ascii_bin;"

        connection.query(q3, (error) => {
          if (error) {
            throw error;
          }
          console.log('Created table "customers"');
          connection.end();
        });
      });
    } else {
      console.log('Database "bookstore" already exists');
      connection.end();
    }
  });
});
