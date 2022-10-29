const express = require('express');
const cors = require("cors");
require('dotenv').config();

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

app.use('/user', require('./routes/user'));
app.use('/event', require('./routes/event'));
app.use('/friend', require('./routes/friend'));
app.use('/image', require('./routes/image'));
app.use('/code', require('./routes/code'));
app.use('/comment', require('./routes/comment'));
app.use('/auth', require('./routes/auth'));

const PORT = process.env.NODE_ENV === 'local' ? process.env.PUERTO : process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
});