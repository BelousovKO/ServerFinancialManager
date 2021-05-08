const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const usersRoutes = require('./routes/users');
const interfaceRoutes = require('./routes/interface');
const costsRoutes = require('./routes/costs');

app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/users', usersRoutes);
app.use('/interface', interfaceRoutes);
app.use('/costs', costsRoutes);

// Error handling
app.use((err, req, res, next) => {
  const { message } = err;
  res.json({
    status: 'ERROR',
    message
  });
});

app.listen(8080);
