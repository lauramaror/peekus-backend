const { Router } = require('express');

const router = Router();

const {
    getComments
} = require('../controllers/comment');

router.get('/', getComments);

module.exports = router;