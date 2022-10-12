const { Router } = require('express');

const router = Router();

const {
    getEvents,
    getParticipantsByEvent,
    saveEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/event');

router.get('/', getEvents);

router.get('/participants', getParticipantsByEvent);

router.post('/', saveEvent);

router.put('/', updateEvent);

router.delete('/', deleteEvent);

module.exports = router;