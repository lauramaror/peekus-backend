const { Router } = require('express');

const router = Router();

const {
    getUsers,
    saveUser,
    deleteUser
} = require('../controllers/user');

router.get('/', getUsers);

router.post('/', saveUser);

router.delete('/', deleteUser);

module.exports = router;