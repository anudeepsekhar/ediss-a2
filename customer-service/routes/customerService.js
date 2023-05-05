import express from 'express';
import mysql from "mysql"
import kafka from 'kafka-node';



const router = express.Router();

const AWS_RDS_HOST = "a4-databasereplicainstance-0goerubszq2h.cxbr36apofxu.us-east-1.rds.amazonaws.com"
const db = mysql.createConnection({
    host     : AWS_RDS_HOST,
    user     : "ediss",
    password : "password",
    port     : 3306,
    database :"bookstore"
})
const client = new kafka.KafkaClient({ kafkaHost: '44.214.218.139:9092' });
const producer = new kafka.Producer(client);
producer.on('ready', () => {
    console.log('Producer is ready to send messages');
});

producer.on('error', (err) => {
    console.error('Error while initializing producer:', err);
});

db.connect((err) => {
    if (err) {
      console.error('Error connecting to database: ', err);
      return;
    }
    console.log('Connected to customers database!');
  });

//   router.get("/", (req, res)=>{
//     const q = "SELECT * FROM customers"
//     db.query(q, (err, data)=>{
//         if(err) return res.json(err);
//         return res.json(data);
//     });
// })

router.post("/", (req, res)=>{
    const q = "INSERT INTO customers (`id`,`userId`,`name`,`phone`,`address`,`address2`,`city`,`state`,`zipcode`) VALUES (?)"
    const values = [
        null,
        req.body.userId,
        req.body.name,
        req.body.phone,
        req.body.address,
        req.body.address2,
        req.body.city,
        req.body.state,
        req.body.zipcode,
    ]
    
    console.log(req.body)
    if(!req.body.userId || !req.body.name || !req.body.phone || !req.body.address || !req.body.city || !req.body.state || !req.body.zipcode){
        console.log("param missing")
        return res.status(400).end()
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const check1 = !emailRegex.test(req.body.userId);
    if(check1){
        console.log("Email format is wrong")
        return res.status(400).end()
    }
    
    const states = ["AL","AK","AS","AZ","AR","CA","CO","CT","DE","DC","FM","FL","GA","GU","HI","ID","IL","IN","IA","KS","KY","LA","ME","MH","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","MP","OH","OK","OR","PW","PA","PR","RI","SC","SD","TN","TX","UT","VT","VI","VA","WA","WV","WI","WY"]
    const check2 = !states.includes(req.body.state)
    if(check2){
        console.log("State format is wrong")
        return res.status(400).end()
    }

    db.query(q, [values], (err, data)=>{
        if(err){
            console.log(err.code)
            if(err.code === "ER_WARN_DATA_OUT_OF_RANGE"){
                return res.status(400).end()
            }else if(err.code === "ER_DUP_ENTRY"){
                return res.status(422).json({
                    "message": "This user ID already exists in the system."
                })
            }
        }
        console.log(data)
        req.body["id"] = data.insertId
        // nned to send email here
        // Send the message to Kafka
        const topic = 'abolimer.customer.evt';
        const message = { type: 'CustomerRegistered', data: data };
        const payloads = [{ topic, messages: JSON.stringify(message) }];
        producer.send(payloads, (err, data) => {
            if (err) {
            console.error('Error while sending message to Kafka:', err);
            res.status(500).json({ error: 'Error while sending message to Kafka' });
            } else {
            console.log('Message sent to Kafka:', data);
            return res.status(201).location("/customers/"+data.insertId).json(req.body);
            }
        });
    });
})

router.get("/:id", (req, res)=>{
    const id = req.params.id
    console.log(id)
    const idRegex =  /^[1-9]\d*$/;
    const check1 = !idRegex.test(id);
    if(check1){
        console.log("ID format is wrong")
        return res.status(400).end()
    }
    const q = "SELECT * FROM customers WHERE id = ?"
    db.query(q, [id], (err, data)=>{
        if(err){
            console.log(err.code)
            return res.status(500).end()
        }
        if (data.length > 0){
            console.log(data[0])
            return res.status(200).json(data[0])
        }else{
            res.status(404).end()
        }
    })    
})

router.get("/", (req, res)=>{
    const userId = req.query.userId
    const q = "SELECT * FROM customers WHERE userId = ?"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const check1 = !emailRegex.test(userId);
    if(check1){
        console.log("Email format is wrong")
        return res.status(400).end()
    }
    db.query(q, [userId], (err, data)=>{
        if(err){
            console.log(err.code)
            return res.status(400).end()
        }
        if (data.length > 0){
            console.log(data[0])
            return res.status(200).json(data[0])
        }else{
            res.status(404).end()
        }
    })  
})

export default router;