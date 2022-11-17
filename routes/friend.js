const { Router } = require('express');

const router = Router();

const {
    getFriends,
    saveFriend,
    updateFriend,
    deleteFriend
} = require('../controllers/friend');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getFriends);

router.post('/', [validateJWT], saveFriend);

router.put('/', [validateJWT], updateFriend);

router.delete('/', [validateJWT], deleteFriend);

module.exports = router;