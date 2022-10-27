const { Router } = require('express');

const router = Router();

const {
    login,
    token
} = require('../controllers/auth');

router.get('/token', token);

router.post('/', login);

module.exports = router;