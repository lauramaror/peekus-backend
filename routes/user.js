const { Router } = require('express');

const router = Router();

const {
    getUsers,
    saveUser,
    updateUser,
    deleteUser
} = require('../controllers/user');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getUsers);

router.post('/', saveUser);

router.put('/', [validateJWT], updateUser);

router.delete('/', [validateJWT], deleteUser);

module.exports = router;