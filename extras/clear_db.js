import mysql from "mysql"

const db = mysql.createConnection({
    host     : "a4-databasereplicainstance-0goerubszq2h.cxbr36apofxu.us-east-1.rds.amazonaws.com",
    user     : "ediss",
    password : "password",
    port     : 3306,
    database :"bookstore"
})

db.connect((err) => {
    if (err) {
      console.error('Error connecting to database: ', err);
      return;
    }
    console.log('Connected to books database!');
  });
  
const q1 = "DELETE FROM books"
db.query(q1, (err, data)=>{
  if(err) console.log(err);
  console.log(data);
});

const q2 = "DELETE FROM customers"
db.query(q2, (err, data)=>{
  if(err) console.log(err);
  console.log(data);
});