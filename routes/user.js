const { Router } = require('express');
// const { check } = require('express-validator');

const router = Router();

const {
    getUsers
} = require('../controllers/user');

router.get('/', getUsers);

module.exports = router;