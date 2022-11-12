const { Router } = require('express');

const router = Router();

const {
    getCodes,
    saveCode
} = require('../controllers/code');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getCodes);

router.post('/', [validateJWT], saveCode);

module.exports = router;