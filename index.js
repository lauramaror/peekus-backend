const express = require('express');
const cors = require("cors");
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', require('./routes/user'));

// const PORT = process.env.NODE_ENV === 'local' ? process.env.PUERTO : process.env.PORT || 5000;
const PORT = process.env.PUERTO;
app.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
});