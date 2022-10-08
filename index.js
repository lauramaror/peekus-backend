const express = require('express');
const cors = require("cors");
const { conexionDB } = require('./helpers/configdb');
require('dotenv').config();

const app = express();

conexionDB();

app.use(cors());
app.use(express.json());

app.listen(process.env.PUERTO, () => {
    console.log('Servidor escuchando en el puerto', process.env.PUERTO);
});