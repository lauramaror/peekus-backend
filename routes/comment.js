const { Router } = require('express');

const router = Router();

const {
    getComments,
    saveComment,
    deleteComment
} = require('../controllers/comment');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getComments);

router.post('/', [validateJWT], saveComment);

router.delete('/', [validateJWT], deleteComment);

module.exports = router;