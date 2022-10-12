const { Router } = require('express');

const router = Router();

const {
    getUsers,
    saveUser,
    updateUser,
    deleteUser
} = require('../controllers/user');

router.get('/', getUsers);

router.post('/', saveUser);

router.put('/', updateUser);

router.delete('/', deleteUser);

module.exports = router;