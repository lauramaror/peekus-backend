const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { isStringInEnum, NOTIFICATION_TYPE } = require('../helpers/enums');
const { v4: uuidv4 } = require('uuid');

const getNotifications = async(req, res = response) => {
    const id = req.query.id || '';
    const idEvent = req.query.idEvent || '';
    const type = req.query.type || '';
    console.log('getNotifications');
    try {
        let query = 'SELECT * FROM notification';
        if (id) query += ' WHERE id = \'' + id + '\'';
        if (idEvent) query += id ? ' AND idEvent = \'' + idEvent + '\'' : ' WHERE idEvent = \'' + idEvent + '\'';
        if (type) query += (id || idEvent) ? ' AND type = \'' + type + '\'' : ' WHERE type = \'' + type + '\'';
        let notifications = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    notifications.push(row);
                });
                res.json(notifications);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining notifications'
        });
    }
}

const saveNotification = async(req, res = response) => {
    console.log('saveNotification');
    const body = req.body;
    const type = body.type;
    const idEvent = body.idEvent;
    const description = body.description;
    try {
        if ((type && isStringInEnum(type, NOTIFICATION_TYPE)) && (idEvent && await checkIfEventExists(idEvent))) {
            const idNotif = uuidv4();

            let query = 'INSERT INTO notification SET ?';
            let values = {
                id: idNotif,
                description: description,
                notifiedDate: new Date().toISOString().replace('T', ' ').split('.')[0],
                type: type,
                idEvent: idEvent,
                redirectLink: '/base/detail/' + idEvent,
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Notification created',
                        id: idNotif
                    });
                }
            });
        } else {
            res.status(500).json({
                ok: false,
                msg: 'Invalid parameters',
            });
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error saving notification',
        });
    }
}

const getNotificationUsers = async(req, res = response) => {
    const idNotification = req.query.idNotification || '';
    const idUser = req.query.idUser || '';
    const notified = req.query.notified;
    console.log('getNotificationUsers');
    try {
        let query = 'SELECT nu.*, n.description, n.redirectLink, u.username, u.idProfilePicture FROM notification_user nu LEFT JOIN notification n ON nu.idNotification = n.id LEFT JOIN user u ON nu.idUser = u.id';
        if (idNotification) query += ' WHERE nu.idNotification = \'' + idNotification + '\'';
        if (idUser) query += idNotification ? ' AND nu.idUser = \'' + idUser + '\'' : ' WHERE nu.idUser = \'' + idUser + '\'';
        if (notified) query += (idNotification || idUser) ? ' AND notified = ' + notified : ' WHERE notified = ' + notified;
        let notifications = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    notifications.push(row);
                });
                res.json(notifications);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining notifications'
        });
    }
}

const saveNotificationUsers = async(req, res = response) => {
    console.log('saveNotificationUsers');
    const body = req.body;
    const idNotification = body.idNotification;
    const idUsers = body.idUsers;
    try {
        if ((idNotification && await checkIfNotificationExists(idNotification))) {

            let query = 'INSERT INTO notification_user VALUES';
            let values = [];
            const idNotifUser = uuidv4();
            for await (const idUser of idUsers) {
                if (await checkIfUserExists(idUser)) {
                    values.push('(\'' + idNotifUser + '\',\'' + idNotification + '\',\'' + idUser + '\', 0, \'' + new Date().toISOString().replace('T', ' ').split('.')[0] + '\')');
                }
            }
            query += values.join(',');

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Notification user created',
                    });
                }
            });
        } else {
            res.status(500).json({
                ok: false,
                msg: 'Invalid parameters',
            });
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error saving notification user',
        });
    }
}

const updateNotified = async(req, res = response) => {
    console.log('updateNotified');
    const id = req.query.id;
    try {
        if ((id && await checkIfNotificationUserExists(id))) {

            let query = 'UPDATE notification_user SET ? WHERE id=\'' + id + '\'';
            let values = {
                notified: '1'
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Notification user updated'
                    });
                }
            });
        } else {
            res.status(500).json({
                ok: false,
                msg: 'Invalid parameters',
            });
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error updating notification user',
        });
    }
}

// const deleteNotification = async(req, res = response) => {
//     console.log('deleteCode');
//     const id = req.query.id;
//     try {
//         if ((id && await checkIfCodeExists(id))) {

//             let query = 'DELETE FROM code WHERE id=\'' + id + '\'';

//             conexionDB(query, function(err, rows) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     res.json({
//                         ok: true,
//                         msg: 'Code deleted'
//                     });
//                 }
//             });
//         } else {
//             res.status(500).json({
//                 ok: false,
//                 msg: 'Invalid parameters',
//             });
//             return;
//         }

//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             ok: false,
//             msg: 'Error deleting code',
//         });
//     }
// }

const checkIfEventExists = (eventId) => {
    let query = 'SELECT * FROM event WHERE id=\'' + eventId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfNotificationExists = (codeId) => {
    let query = 'SELECT * FROM notification WHERE id=\'' + codeId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfUserExists = (codeId) => {
    let query = 'SELECT * FROM user WHERE id=\'' + codeId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfNotificationUserExists = (codeId) => {
    let query = 'SELECT * FROM notification_user WHERE id=\'' + codeId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

module.exports = {
    getNotifications,
    saveNotification,
    getNotificationUsers,
    saveNotificationUsers,
    updateNotified
};