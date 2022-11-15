const { Router } = require('express');

const router = Router();

const {
    getCodes,
    saveCode,
    generateQR
} = require('../controllers/code');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getCodes);

router.post('/', [validateJWT], saveCode);

router.post('/qr', [validateJWT], generateQR);

module.exports = router;