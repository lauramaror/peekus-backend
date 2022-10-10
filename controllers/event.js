const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getEvents = async(req, res = response) => {
    const id = req.query.id || '';
    const type = req.query.type || '';
    const status = req.query.status || '';
    console.log('getEvents', id, type, status);
    try {
        let query = 'SELECT e.*, GROUP_CONCAT(ep.idParticipant) AS participants, GROUP_CONCAT(ep.completed) AS completed, GROUP_CONCAT(ifnull(ep.idImage, \'null\')) AS images FROM peekus.event e LEFT OUTER JOIN peekus.event_participants ep ON e.id = ep.idEvent';
        let events = [];

        if (id || type || status) {
            query += ' WHERE';
            if (id) query += ' e.id=\'' + id + '\'';
            if (type) query += id ? ' AND e.type=' + type : ' e.type=' + type;
            if (status) query += id || type ? ' AND e.status=' + status : ' e.status=' + status;
        }

        query += ' GROUP BY e.id';

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    const participantsList = row.participants ? row.participants.split(',') : [];
                    row.participants = [];
                    participantsList.forEach((participantId, index) => {
                        row.participants.push({
                            idParticipant: participantId,
                            completed: row.completed.split(',')[index] === '1',
                            idImage: row.images.split(',')[index] === 'null' ? null : row.images.split(',')[index]
                        });
                    })
                    delete row.completed;
                    delete row.images;
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