/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// Use this headers object when doing an axios call to the API.
const express = require('express');
const Axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const {TOKEN, URL} = require('../config.js');
const db = require('../database');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

const config = {
  headers: {
    'Authorization': TOKEN,
    'Content-Type': 'application/json',
  },
};

app.get('/products', db.getProducts);

// app.get('/products', (req, res) => {
//   Axios.get(URL + '/products', config).then((response) => {
//     res.send(response.data);
//   });
// });

// app.get('/*', (req, res) => {
//   Axios.get(URL + req.originalUrl, config).then((response) => {
//     res.send(response.data);
//   });
// });

// app.post('/*', (req, res) => {
//   Axios.post(URL + req.originalUrl, req.body, config).then((response) => {
//     res.send(response.data);
//   });
// });

// app.put('/*', (req, res) => {
//   Axios.put(URL + req.originalUrl, req.body, config).then((response) => {
//     res.send('success');
//   });
// });

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
