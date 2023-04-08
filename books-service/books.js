import express from "express"
import booksRouter from './routes/booksService.js'

// require("dotenv").config();

const app = express()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/books', booksRouter);

app.get("/", (req, res)=>{
    res.json("this is the books service");
})

app.listen(3000, () => {
    console.log("Connected to backend!");
})