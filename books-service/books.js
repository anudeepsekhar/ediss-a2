import express from "express"
import booksCmdRouter from './routes/booksCommand.js'
import booksQueryRouter from './routes/booksQuery.js'

// require("dotenv").config();

const app = express()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/cmd/books', booksCmdRouter);
app.use('/books', booksRouter);

app.get("/", (req, res)=>{
    res.json("this is the books service");
})
app.get("/status", (req, res)=>{
    res.setHeader('Content-Type', 'text/plain');
    res.send('OK');
  })

app.listen(3000, () => {
    console.log("Connected to backend!");
})