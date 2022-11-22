const { Router } = require('express');

const router = Router();

const {
    getNotifications,
    saveNotification,
    getNotificationUsers,
    saveNotificationUsers,
    updateNotified
} = require('../controllers/notification');

const { validateJWT } = require('../helpers/validatejwt');

router.get('/', [validateJWT], getNotifications);

router.post('/', [validateJWT], saveNotification);

router.get('/users', [validateJWT], getNotificationUsers);

router.post('/users', [validateJWT], saveNotificationUsers);

router.put('/users', [validateJWT], updateNotified);

// router.delete('/', [validateJWT], deleteCode);

module.exports = router;