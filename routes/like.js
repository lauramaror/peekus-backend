const { Router } = require('express');

const router = Router();

const {
    getLikes,
    saveLike,
    deleteLike
} = require('../controllers/like');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getLikes);

router.post('/', [validateJWT], saveLike);

router.delete('/', [validateJWT], deleteLike);

module.exports = router;