const { Router } = require('express');

const router = Router();

const {
    getUsers,
    saveUser,
    updateUser,
    deleteUser,
    updateProfilePicture,
    checkUsername
} = require('../controllers/user');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getUsers);

router.get('/username', checkUsername);

router.post('/', saveUser);

router.put('/profilepic', [validateJWT], updateProfilePicture);

router.put('/', [validateJWT], updateUser);

router.delete('/', [validateJWT], deleteUser);

module.exports = router;