const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const router = Router();

const {
    getImages,
    saveImage,
    generateCollage,
    updateImage,
    deleteImage
} = require('../controllers/image');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getImages);

router.post('/', [validateJWT], saveImage);

router.put('/', [validateJWT], updateImage);

router.delete('/', [validateJWT], deleteImage);

router.post('/collage', [validateJWT], generateCollage);

module.exports = router;