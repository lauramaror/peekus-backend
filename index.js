const express = require('express');
const cors = require("cors");
require('dotenv').config();
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(express.json());

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
}));

app.use('/user', require('./routes/user'));
app.use('/event', require('./routes/event'));
app.use('/friend', require('./routes/friend'));
app.use('/image', require('./routes/image'));
app.use('/code', require('./routes/code'));
app.use('/comment', require('./routes/comment'));
app.use('/auth', require('./routes/auth'));
app.use('/like', require('./routes/like'));

const PORT = process.env.NODE_ENV === 'local' ? process.env.PUERTO : process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('Server listening on port', PORT);
});