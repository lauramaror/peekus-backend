const { Router } = require('express');

const router = Router();

const {
    getEvents,
    getParticipantsByEvent,
    saveEvent,
    updateEvent,
    deleteEvent
} = require('../controllers/event');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getEvents);

router.get('/participants', [validateJWT], getParticipantsByEvent);

router.post('/', [validateJWT], saveEvent);

router.put('/', [validateJWT], updateEvent);

router.delete('/', [validateJWT], deleteEvent);

module.exports = router;