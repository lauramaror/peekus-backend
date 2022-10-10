const { Router } = require('express');

const router = Router();

const {
    getImages
} = require('../controllers/image');

router.get('/', getImages);

module.exports = router;