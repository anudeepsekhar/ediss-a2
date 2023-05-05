import express from 'express';
import axios from 'axios';


const app = express();
app.use(express.json());

// Books Microservice endpoint
//const booksServiceUrl = 'http://alb-202734867.us-east-1.elb.amazonaws.com:3000';
const booksServiceUrl = 'http://books-backend-service.book-store-ns.svc:3000';
const booksRecomendationURL = 'http://44.214.218.139/recommended-titles/isbn';
console.log(booksServiceUrl)

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
        var dateFormat = new Date(decoded.exp*1000);
	console.log(dateFormat.getTime())
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
    res.json("this is the books backend");
})
app.get("/status", (res, req)=>{
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
})

  app.get('/books/', authenticateJWT, async (req, res) => {
    const userAgent = req.headers['user-agent'];
    console.log(userAgent)
    try {
      const response = await axios.get(`${booksServiceUrl}/books/`);
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
  
app.get('/books/:isbn', authenticateJWT, async (req, res) => {
  const userAgent = req.headers['user-agent'];
  console.log(userAgent)
  const isbn = req.params.isbn
  try {
    const response = await axios.get(`${booksServiceUrl}/books/${isbn}`);
    if (userAgent && userAgent.includes('Mobile')) {
      // Filter books for mobile client
      var book = response.data
      if (book.genre === "non-fiction") {
        book.genre = 3;
      }
    } else {
      var book = response.data;
    }
    res.json(book);
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

app.get('/books/:isbn/related-books', authenticateJWT, async (req, res) => {
  const isbn = req.params.isbn
  try {
    const response = await axios.get(`${booksServiceUrl}/books/related-books/${isbn}`);
    console.log(response)
    if (response.status === 200){
      return res.status(200).json(response.data)
    }else{
      return res.status(204).end()
    }
    
  }catch(error){
    console.log(error)
    if (error.response.status === 504){
      return res.status(504).json('circuit open!')
    } else if (error.response.status === 503){
      return res.status(503).json('its too soon for request!')
    }else{
      return res.status(500).json(error)
    }
  }

});

app.get('/books/isbn/:isbn', authenticateJWT, async (req, res) => {
    const userAgent = req.headers['user-agent'];
    console.log(userAgent)
    const isbn = req.params.isbn
    try {
      const response = await axios.get(`${booksServiceUrl}/books/${isbn}`);
      if (userAgent && userAgent.includes('Mobile')) {
        // Filter books for mobile client
        var book = response.data
        if (book.genre === "non-fiction") {
          book.genre = 3;
        }
      } else {
        var book = response.data;
      }
      res.json(book);
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

  app.post('/books', authenticateJWT, async (req, res) => {
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    const userAgent = req.headers['user-agent'];
    // Perform validation on request body
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Send request to books microservice to create a new book
      const response = await axios.post(`${booksServiceUrl}/books`, { ISBN, title, Author, description, genre, price, quantity });
      console.log(response.data)
      var book = response.data
      res.status(201).json(book);
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
app.put('/books/:isbn', authenticateJWT, async (req, res) => {
    const isbn = req.params.isbn
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    const userAgent = req.headers['user-agent'];
    // Perform validation on request body
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Send request to books microservice to create a new book
      const response = await axios.put(`${booksServiceUrl}/books/${isbn}`, { ISBN, title, Author, description, genre, price, quantity });
      var book = response.data
      res.status(response.status).json(book);
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
app.listen(82, () => {
  console.log('Books BFF is running on PORT 82');
});
