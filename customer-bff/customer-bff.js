import express from 'express';
import axios from 'axios';


const app = express();
app.use(express.json());

// Books Microservice endpoint
//const booksServiceUrl = 'http://alb-202734867.us-east-1.elb.amazonaws.com:3000';
const customerServiceUrl = `http://${process.env.HOST_IP}:3000`;
console.log(customerServiceUrl)

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = parseJwt(token)
    // Get the current timestamp in seconds
    const currentTimestamp = Date.now();
    console.log(currentTimestamp)

    if (decoded && decoded.sub && ["starlord", "gamora", "drax", "rocket", "groot"].includes(decoded.sub)) {
        console.log(decoded.exp)
        var dateFormat = new Date(decoded.exp);
        console.log(dateFormat.getTime()> currentTimestamp)

        if (decoded && decoded.exp && dateFormat.getTime() > currentTimestamp) {
            if (decoded && decoded.iss && decoded.iss === 'cmu.edu') {
                console.log(`"iss" claim is valid. Value: ${decoded.iss}`);
            } else {
                return res.status(401).json({ error: 'Forbidden-exp' });
            }
        } else {
            return res.status(401).json({ error: 'Forbidden-exp' });
        }
    } else {
        return res.status(401).json({ error: 'Forbidden-sub' });
    }
    next();
  };

  app.get("/", (req, res)=>{
    res.json("this is the customer backend");
})

  app.get('/customer/', authenticateJWT, async (req, res) => {
    const userAgent = req.headers['user-agent'];
    console.log(userAgent)
    try {
      const response = await axios.get(`${customerServiceUrl}/customer/`);
      res.json(response.data);
    } catch (error) {
      if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          res.status(error.response.status).json(error.response.data);
  
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
          res.status(500).json({ error: 'Internal server error no response' });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
          res.status(500).json({ error: 'Internal server error Something happened in setting up the request that triggered an Error' });
        }
    }
  });
  
app.get('/customer/:id', authenticateJWT, async (req, res) => {
  const userAgent = req.headers['user-agent'];
  console.log(userAgent)
  const id = req.params.id
  try {
    const response = await axios.get(`${booksServiceUrl}/customer/${id}`);
    if (userAgent && userAgent.includes('Mobile')) {
      // Filter books for mobile client
      var customer = response.data
      delete customer.address
      delete customer.address2
      delete customer.state
      delete customer.city
      delete customer.zipcode
    } else {
      var customer = response.data;
    }
    res.json(customer);
  } catch (error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        res.status(error.response.status).json(error.response.data);

      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
  }
});

app.get('/customer/', authenticateJWT, async (req, res) => {
    const userAgent = req.headers['user-agent'];
    console.log(userAgent)
    const userIdVal = req.query.userId
    try {
      const response = await axios.get(`${booksServiceUrl}/customer/`, {params: {userId:userIdVal}});
      if (userAgent && userAgent.includes('Mobile')) {
        // Filter books for mobile client
        var customer = response.data
        delete customer.address
        delete customer.address2
        delete customer.state
        delete customer.city
        delete customer.zipcode
      } else {
        var customer = response.data;
      }
      res.json(customer);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            res.status(error.response.status).json(error.response.data);

          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            res.status(500).json({ error: 'Internal server error' });
          }
    }
  });

  app.post('/customer', authenticateJWT, async (req, res) => {
    const { userId, name, phone, address, address2, city, state, zipcode } = req.body;
    const userAgent = req.headers['user-agent'];
    // Perform validation on request body
    if (!userId || !name || !phone || !address || !address2 || !city || !state || !zipcode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Send request to books microservice to create a new book
      const response = await axios.post(`${booksServiceUrl}/customer`, { userId, name, phone, address, address2, city, state, zipcode });
      console.log(response)
      if (userAgent && userAgent.includes('Mobile')) {
        // Filter books for mobile client
        var customer = response.data
        delete customer.address
        delete customer.address2
        delete customer.state
        delete customer.city
        delete customer.zipcode
      } else {
        var customer = response.data;
      }
      res.json(customer);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            res.status(error.response.status).json(error.response.data);

          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            res.status(500).json({ error: 'Internal server error' });
          }
    }
  });

app.listen(81, () => {
  console.log('Customer BFF is running on http://localhost:81');
});
