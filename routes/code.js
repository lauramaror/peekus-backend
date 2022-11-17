const { Router } = require('express');

const router = Router();

const {
    getCodes,
    saveCode,
    generateQR,
    updateCode,
    deleteCode
} = require('../controllers/code');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getCodes);

router.post('/', [validateJWT], saveCode);

router.put('/', [validateJWT], updateCode);

router.delete('/', [validateJWT], deleteCode);

router.post('/qr', [validateJWT], generateQR);

module.exports = router;