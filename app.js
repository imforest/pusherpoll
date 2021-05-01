require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT;

// DB Config
require('./config/db');

const app = express();
const poll = require('./routes/poll');

app.set('view engine', 'ejs');
// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Enable CORS
app.use(cors());

app.use('/poll', poll);


// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));	
