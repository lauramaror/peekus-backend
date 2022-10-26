const { Router } = require('express');

const router = Router();

const {
    getImages
} = require('../controllers/image');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getImages);

module.exports = router;