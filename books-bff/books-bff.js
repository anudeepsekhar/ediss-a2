import express from 'express';
import axios from 'axios';


const app = express();
app.use(express.json());

// Books Microservice endpoint
//const booksServiceUrl = 'http://alb-202734867.us-east-1.elb.amazonaws.com:3000';
const booksQueryServiceUrl = 'http://books-query-service.book-store-ns.svc:3000';
const booksCmdServiceUrl = 'http://books-cmd-service.book-store-ns.svc:3000';
console.log(booksQueryServiceUrl)
console.log(booksCmdServiceUrl)

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
    // console.log(currentTimestamp)

    if (decoded && decoded.sub && ["starlord", "gamora", "drax", "rocket", "groot"].includes(decoded.sub)) {
        // console.log(decoded.exp)
        var dateFormat = new Date(decoded.exp*1000);
	// console.log(dateFormat.getTime())
        // console.log(dateFormat.getTime()> currentTimestamp)

        if (decoded && decoded.exp && dateFormat.getTime() > currentTimestamp) {
            if (decoded && decoded.iss && decoded.iss === 'cmu.edu') {
                // console.log(`"iss" claim is valid. Value: ${decoded.iss}`);
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
app.get("/status", (req, res)=>{
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
})

  app.get('/books/', authenticateJWT, async (req, res) => {
    const { keyword } = req.query;
    const keywordRegex = /^[a-zA-Z]+$/;
    if (!keyword || !keywordRegex.test(keyword)) {
        return res.status(400).send('Keyword parameter must be a single word of letters only');
    }
    const userAgent = req.headers['user-agent'];
    console.log(userAgent)
    try {
      const response = await axios.get(`${booksQueryServiceUrl}/books?keyword=${keyword}`);
      console.log("Keyword search: ")
      console.log(keyword)
      return res.json(response.data);
    } catch (error) {
      if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          return res.status(error.response.status).json(error.response.data);
  
        } else if (error.request) {
          // The request was made but no response was received
          console.log(error.request);
          return res.status(500).json({ error: 'Internal server error no response' });
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
          return res.status(500).json({ error: 'Internal server error Something happened in setting up the request that triggered an Error' });
        }
    }
  });
  
app.get('/books/:isbn', authenticateJWT, async (req, res) => {
  const userAgent = req.headers['user-agent'];
  console.log("GET: ")
  const isbn = req.params.isbn
  console.log(isbn)

  try {
    const response = await axios.get(`${booksQueryServiceUrl}/books/${isbn}`);
    if (userAgent && userAgent.includes('Mobile')) {
      // Filter books for mobile client
      var book = response.data
      if (book.genre === "non-fiction") {
        book.genre = 3;
      }
    } else {
      var book = response.data;
    }
    return res.json(book);
  } catch (error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        return res.status(error.response.status).json(error.response.data);

      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        return res.status(500).json({ error: 'Internal server error' });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        return res.status(500).json({ error: 'Internal server error' });
      }
  }
});

app.get('/books/:isbn/related-books', authenticateJWT, async (req, res) => {
  const isbn = req.params.isbn
  try {
    const response = await axios.get(`${booksQueryServiceUrl}/books/related-books/${isbn}`);
    if (response.status === 200){
      return res.status(200).json(response.data)
    }else{
      return res.status(204).end()
    }
    
  }catch(error){
    // console.log(error)
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
    console.log("GET: ")
    const isbn = req.params.isbn
    console.log(isbn)

    try {
      const response = await axios.get(`${booksQueryServiceUrl}/books/${isbn}`);
      if (userAgent && userAgent.includes('Mobile')) {
        // Filter books for mobile client
        var book = response.data
        if (book.genre === "non-fiction") {
          book.genre = 3;
        }
      } else {
        var book = response.data;
      }
      return res.json(book);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            return res.status(error.response.status).json(error.response.data);

          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
            return res.status(500).json({ error: 'Internal server error' });
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            return res.status(500).json({ error: 'Internal server error' });
          }
    }
  });

  app.post('/cmd/books', authenticateJWT, async (req, res) => {
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    const userAgent = req.headers['user-agent'];
    console.log("POST: ")
    console.log(ISBN)
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Send request to books microservice to create a new book
      const response = await axios.post(`${booksCmdServiceUrl}/cmd/books`, { ISBN, title, Author, description, genre, price, quantity });
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
app.put('/cmd/books/:isbn', authenticateJWT, async (req, res) => {
    const isbn = req.params.isbn
    console.log("PUT: ")
    console.log(isbn)
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    console.log(req.body)
    const userAgent = req.headers['user-agent'];
    // Perform validation on request body
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      // Send request to books microservice to create a new book
      const response = await axios.put(`${booksCmdServiceUrl}/cmd/books/${isbn}`, { ISBN, title, Author, description, genre, price, quantity });
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
