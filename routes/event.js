const { Router } = require('express');

const router = Router();

const {
    getEvents,
    getParticipantsByEvent,
    saveEvent,
    updateEvent,
    deleteEvent,
    saveParticipant,
    deleteParticipant
} = require('../controllers/event');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getEvents);

router.get('/participants', [validateJWT], getParticipantsByEvent);

router.post('/', [validateJWT], saveEvent);

router.put('/', [validateJWT], updateEvent);

router.delete('/', [validateJWT], deleteEvent);

router.post('/participants', [validateJWT], saveParticipant);

router.delete('/participants', [validateJWT], deleteParticipant);

module.exports = router;