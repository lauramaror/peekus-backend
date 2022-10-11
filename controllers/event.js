const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getEvents = async(req, res = response) => {
    const id = req.query.id || '';
    const type = req.query.type || '';
    const status = req.query.status || '';
    const creator = req.query.creator || '';
    const participant = req.query.participant || '';
    console.log(participant);
    console.log('getEvents');
    try {
        // let query = 'SELECT e.*, GROUP_CONCAT(ep.idParticipant) AS participants, GROUP_CONCAT(ep.completed) AS completed, GROUP_CONCAT(ifnull(ep.idImage, \'null\')) AS images FROM peekus.event e LEFT OUTER JOIN peekus.event_participants ep ON e.id = ep.idEvent';
        let query = 'SELECT e.* FROM event e LEFT OUTER JOIN event_participants ep ON e.id = ep.idEvent';
        let events = [];

        if (id || type || status || creator || participant) {
            query += ' WHERE';
            if (id) query += ' e.id=\'' + id + '\'';
            if (type) query += id ? ' AND e.type=' + type : ' e.type=' + type;
            if (status) query += (id || type) ? ' AND e.status=' + status : ' e.status=' + status;
            if (creator) query += (id || type || status) ? ' AND e.creator=\'' + creator + '\'' : ' e.creator=\'' + creator + '\'';
            if (participant) query += (id || type || status || creator) ? ' AND ep.idParticipant=\'' + participant + '\'' : ' ep.idParticipant=\'' + participant + '\'';
        }

        query += ' GROUP BY e.id';

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    // row.participants = [];
                    // let queryParticipants = 'SELECT * FROM event_participants WHERE idEvent = \'' + row.id + '\'';
                    // conexionDB(queryParticipants, function(errp, participantsRes) {
                    //     if (errp) {
                    //         console.log(errp);
                    //     } else {
                    //         row.participants = participantsRes.map(p => ({
                    //             ...p
                    //         }));
                    //     }
                    // });
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

module.exports = {
    getEvents
};