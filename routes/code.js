const { Router } = require('express');

const router = Router();

const {
    getCodes
} = require('../controllers/code');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getCodes);

module.exports = router;