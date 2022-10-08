const express = require('express');
const cors = require("cors");
require('dotenv').config();

const app = express();

// conexionDB();

app.use(cors());
app.use(express.json());

app.use('/user', require('./routes/user'));

app.listen(process.env.PUERTO, () => {
    console.log('Servidor escuchando en el puerto', process.env.PUERTO);
});