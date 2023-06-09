import express from "express"
import customersRouter from './routes/customerService.js'

// require("dotenv").config();

const app = express()

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/customers', customersRouter);

app.get("/", (req, res)=>{
    res.json("this is the backend");
})

app.listen(3000, () => {
    console.log("Connected to backend!");
})
