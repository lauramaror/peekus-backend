const { Router } = require('express');

const router = Router();

const {
    getFriends
} = require('../controllers/friend');

router.get('/', getFriends);

module.exports = router;