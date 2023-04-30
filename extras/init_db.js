import mysql from "mysql"

const db = mysql.createConnection({                                                                               
    host     : "a3-databasereplicainstance-towmnpstiycy.cdzfxmkoehy9.us-east-1.rds.amazonaws.com",                
    user     : "ediss",                                                                                           
    password : "password",                                                                                        
    port     : 3306,                                                                                              
    database : "bookstore"                                                                                         
  });


db.connect((err) => {
    if (err) {
      console.error('Error connecting to database: ', err);
      return;
    }
    console.log('Connected to books database!');
  });

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
db.query(q2, (err, data)=>{                                                                                       
  if(err) console.log(err);                                                                                       
  console.log(data);                                                                                              
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
db.query(q3, (err, data)=>{                                                                                       
  if(err) console.log(err);                                                                                       
  console.log(data);                                                                                              
});   