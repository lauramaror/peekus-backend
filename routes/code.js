const { Router } = require('express');

const router = Router();

const {
    getCodes
} = require('../controllers/code');

router.get('/', getCodes);

module.exports = router;