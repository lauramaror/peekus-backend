const { Router } = require('express');

const router = Router();

const {
    getFriends
} = require('../controllers/friend');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getFriends);

module.exports = router;