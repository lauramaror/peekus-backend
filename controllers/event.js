const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { v4: uuidv4 } = require('uuid');
const { isStringInEnum, EVENT_TYPE, EVENT_STATUS } = require('../helpers/enums');

const getEvents = async(req, res = response) => {
    const id = req.query.id || '';
    const type = req.query.type || '';
    const status = req.query.status || '';
    const creator = req.query.creator || '';
    const participant = req.query.participant || '';
    const user = req.query.user || participant || '';
    console.log('getEvents');
    try {
        let query = 'SELECT e.*, u.name as creatorName, u.username as creatorUsername, COUNT(DISTINCT ep.idParticipant) as participants, COUNT(DISTINCT l.idUser) as likes, COUNT(DISTINCT c.idUser) as comments, ';
        query += 'epu.completed as completedByUser, epu.idImage as userImage, ';
        query += 'case l.idUser when \'' + user + '\' then true else false end as likedByUser FROM event e ';
        query += 'LEFT OUTER JOIN event_participants ep ON e.id = ep.idEvent ';
        query += 'LEFT OUTER JOIN \`like\` l ON e.id = l.idEvent ';
        query += 'LEFT OUTER JOIN comment c ON e.id = c.idEvent ';
        query += 'LEFT OUTER JOIN user u ON u.id = e.creator ';
        query += 'LEFT OUTER JOIN event_participants epu ON epu.idEvent = e.id';

        let events = [];

        if (id || type || status || creator || participant) {
            query += ' WHERE';
            if (id) query += ' e.id=\'' + id + '\'';
            if (type) query += id ? ' AND e.type in (' + type + ')' : ' e.type in (' + type + ')';
            if (status) query += (id || type) ? ' AND e.status in (' + status + ')' : ' e.status in (' + status + ')';
            if (creator) query += (id || type || status) ? ' AND e.creator=\'' + creator + '\'' : ' e.creator=\'' + creator + '\'';
            if (participant) query += (id || type || status || creator) ? ' AND epu.idParticipant=\'' + participant + '\'' : ' epu.idParticipant=\'' + participant + '\'';
        }

        query += ' GROUP BY e.id';

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    events.push(row);

                });
                res.json(events);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining events'
        });
    }
}

const getParticipantsByEvent = async(req, res = response) => {
    const idEvent = req.query.idEvent || '';
    const completed = req.query.completed || '';

    console.log('getParticipantsByEvent');
    try {
        if (idEvent) {
            let query = 'SELECT ep.*, u.name as name, u.username as username, u.idProfilePicture as idProfilePicture FROM event_participants ep LEFT OUTER JOIN user u ON ep.idParticipant = u.id ';
            query += 'WHERE idEvent = \'' + idEvent + '\'';
            if (completed) {
                query += ' AND completed=\'' + completed + '\'';
            }
            let participants = [];

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    rows.forEach(row => {
                        participants.push(row);

                    });
                    res.json(participants);
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining participants'
        });
    }
}

const saveEvent = async(req, res = response) => {
    console.log('saveEvent');
    const body = req.body;
    const name = body.name;
    const description = body.description;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const capacity = body.capacity;
    const creator = body.creator;
    const type = body.type;
    const status = body.status;
    try {
        if ((name && name !== '') && (creator && await checkIfUserExists(creator)) && (type && isStringInEnum(type, EVENT_TYPE)) && (status && isStringInEnum(status, EVENT_STATUS)) && (startDate && !isNaN(Date.parse(startDate)))) {
            const idEvent = uuidv4();
            let query = 'INSERT INTO \`event\` VALUES (\'' + idEvent + '\', \'' + name + '\', ';
            query += description ? '\'' + description + '\', ' : null + ', ';
            query += 'UTC_TIMESTAMP, \'' + startDate + '\', ';
            query += endDate ? '\'' + endDate + '\', ' : null + ', ';
            query += capacity ? '\'' + capacity + '\', ' : null + ', ';
            query += '\'' + creator + '\', \'' + type + '\', \'' + status + '\', ' + null + ')';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        idEvent: idEvent,
                        msg: 'Event created',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: 'Error saving event',
        });
    }
}

const checkIfUserExists = (userId) => {
    let query = 'SELECT * FROM user WHERE id=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const updateEvent = async(req, res = response) => {
    console.log('updateEvent');
    const body = req.body;
    const id = req.query.id;
    const name = body.name;
    const description = body.description;
    const startDate = body.startDate;
    const endDate = body.endDate;
    const capacity = body.capacity;
    const type = body.type;
    const status = body.status;
    try {
        if ((id && await checkIfEventExists(id)) && (!name || name !== '') && (!type || isStringInEnum(type, EVENT_TYPE)) && (!status || isStringInEnum(status, EVENT_STATUS)) && (!startDate || (!isNaN(Date.parse(startDate))))) {
            let query = 'UPDATE \`event\` SET \`name\`=\'' + name + '\', ';
            query += '\`description\`=' + (description ? '\'' + description + '\', ' : null + ', ');
            query += '\`startDate\`=\'' + startDate + '\', ';
            query += '\`endDate\`=' + (endDate ? '\'' + endDate + '\', ' : null + ', ');
            query += '\`capacity\`=' + (capacity ? '\'' + capacity + '\', ' : null + ', ');
            query += '\`type\`=\'' + type + '\', \`status\`=\'' + status + '\'';
            query += ' WHERE id=\'' + id + '\'';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Event updated',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: 'Error updating event',
        });
    }
}

const deleteEvent = async(req, res = response) => {
    const id = req.query.id;

    try {
        if (!id || (id && !(await checkIfEventExists(id)))) {
            return res.status(500).json({
                ok: false,
                msg: 'Event does not exist'
            });
        }

        let query = 'DELETE FROM \`event\` WHERE \`id\` = \'' + id + '\';'

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    ok: true,
                    msg: 'Event deleted',
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error deleting event'
        });

    }
}

const checkIfEventExists = (eventId) => {
    let query = 'SELECT * FROM event WHERE id=\'' + eventId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const saveParticipant = async(req, res = response) => {
    console.log('saveParticipant');
    const body = req.body;
    const idEvent = body.idEvent;
    const idParticipant = body.idParticipant;
    try {
        if ((idParticipant && await checkIfUserExists(idParticipant)) && (idEvent && await checkIfEventExists(idEvent)) && await checkIfParticipantExists(idEvent, idParticipant)) {
            let query = 'INSERT INTO \`event_participants\` VALUES (\'' + idEvent + '\', \'' + idParticipant + '\', ';
            query += '\'' + 0 + '\', ' + null + ')';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Participant created',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: 'Error saving participant',
        });
    }
}

const deleteParticipant = async(req, res = response) => {
    console.log('deleteParticipant');
    const idEvent = req.query.idEvent;
    const idParticipant = req.query.idParticipant;
    try {
        if ((idParticipant && await checkIfUserExists(idParticipant)) && (idEvent && await checkIfEventExists(idEvent)) && !(await checkIfParticipantExists(idEvent, idParticipant))) {
            let query = 'DELETE FROM \`event_participants\` WHERE idEvent=\'' + idEvent + '\' AND idParticipant=\'' + idParticipant + '\'';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Participant deleted',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: 'Error deleting participant',
        });
    }
}

const checkIfParticipantExists = (eventId, participantId) => {
    let query = 'SELECT * FROM event_participants WHERE idEvent=\'' + eventId + '\' AND idParticipant=\'' + participantId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length == 0);
        })
    });
}

module.exports = {
    getEvents,
    getParticipantsByEvent,
    saveEvent,
    updateEvent,
    deleteEvent,
    saveParticipant,
    deleteParticipant
};