const { Router } = require('express');

const router = Router();

const {
    getComments
} = require('../controllers/comment');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getComments);

module.exports = router;