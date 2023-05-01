import express from 'express';
import mysql from "mysql"

const router = express.Router();

const AWS_RDS_HOST = "a3-databasereplicainstance-tpozeaiebnba.cdzfxmkoehy9.us-east-1.rds.amazonaws.com"

const db = mysql.createConnection({
    host     : AWS_RDS_HOST,
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

router.get("/", (req, res)=>{
    const q = "SELECT * FROM books"
    db.query(q, (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    });
})


router.post("/", (req, res)=>{
    const q = "INSERT INTO books (`ISBN`,`title`,`Author`,`description`,`genre`,`price`,`quantity`) VALUES (?)"
    const values = [
        req.body.ISBN,
        req.body.title,
        req.body.Author,
        req.body.description,
        req.body.genre,
        req.body.price,
        req.body.quantity
    ]
    var regexp = /^\d+(\.\d{2})?$/g
    if(!req.body.ISBN || !req.body.title || !req.body.Author || !req.body.description || !req.body.genre || !req.body.price || !req.body.quantity){
        console.log("param missing")
        return res.status(400).end()
    }

    console.log(req.body.price)
    var check = !regexp.test(req.body.price) 
    console.log(check)
    if(check||req.body.price.toString().split('.')[0].length>10){
        console.log("Price format is wrong")
        return res.status(400).end()
    }

    db.query(q, [values], (err, data)=>{
        if(err){
            console.log(err.code)
            if(err.code === "ER_WARN_DATA_OUT_OF_RANGE"){
                return res.status(400).end()
            }else if(err.code === "ER_DUP_ENTRY"){
                return res.status(422).json({
                    "message": "This ISBN already exists in the system."
                })
            }
        }
        return res.status(201).location("/books/"+req.body.ISBN).json(req.body)
    });
})

router.get("/:isbn", (req, res)=>{
    const isbn = req.params.isbn
    console.log(isbn)
    const q = "SELECT * FROM books WHERE ISBN = ?"
    db.query(q, [isbn], (err, data)=>{
        if(err){
            console.log(err.code)
            return res.json(err)
        }
        if (data.length > 0){
            console.log(data[0])
            return res.status(200).json(data[0])
        }else{
            res.status(404).end()
        }
    })    
})

router.get("/isbn/:isbn", (req, res)=>{
    const isbn = req.params.isbn
    console.log(isbn)
    const q = "SELECT * FROM books WHERE ISBN = ?"
    db.query(q, [isbn], (err, data)=>{
        if(err){
            console.log(err.code)
            return res.json(err)
        }
        if (data.length > 0){
            console.log(data[0])
            return res.status(200).json(data[0])
        }else{
            res.status(404).end()
        }
    })    
})

router.put("/:isbn", (req,res)=>{
    console.log("calling put method..!!")
    const isbn = req.params.isbn


    var regexp = /^\d+(\.\d{2})?$/g
    if(!req.body.ISBN || !req.body.title || !req.body.Author || !req.body.description || !req.body.genre || !req.body.price || !req.body.quantity){
        console.log("param missing")
        return res.status(400).end()
    }

    console.log(req.body.price)
    var check = !regexp.test(req.body.price) 
    console.log(check)
    if(check||req.body.price.toString().split('.')[0].length>10){
        console.log("Price format is wrong")
        return res.status(400).end()
    }
    const q2 = "UPDATE books SET ISBN = ?, title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ? WHERE ISBN = ?"
    const values = [
        req.body.ISBN,
        req.body.title,
        req.body.Author,
        req.body.description,
        req.body.genre,
        req.body.price,
        req.body.quantity,
        isbn
    ]
    db.query(q2, values, (err, data)=>{
        if(err){
            console.log("q2")
            console.error(err);
            return res.status(500).send({
                message: "Error updating book with ISBN " + isbn
            });
        }
        if (data.affectedRows === 0) {
            return res.status(404).end()
          }
        return res.status(200).json(req.body)
    });
})

export default router