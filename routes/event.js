const { Router } = require('express');

const router = Router();

const {
    getEvents
} = require('../controllers/event');

router.get('/', getEvents);

module.exports = router;