const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const items = ['book1','book2','book3'];

app.get('/api/items', (req, res) => {
    res.json(items);
  });
  
app.post('/api/items', (req, res) => {
const newItem = req.body;
items.push(newItem);
res.json(newItem);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
