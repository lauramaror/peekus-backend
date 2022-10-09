const { Router } = require('express');

const router = Router();

const {
    getUsers
} = require('../controllers/user');

router.get('/', getUsers);

module.exports = router;