const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getLikes = async(req, res = response) => {
    const idEvent = req.query.idEvent || '';
    const idUser = req.query.idUser || '';
    console.log('getLikes');
    try {
        let query = 'SELECT c.*, u.name, u.username FROM \`like\` c LEFT OUTER JOIN user u ON c.idUser = u.id ';
        if (idEvent) 'WHERE idEvent = \'' + idEvent + '\'';
        if (idUser) query += idEvent ? ' AND idUser = \'' + idUser + '\'' : 'WHERE idUser = \'' + idUser + '\'';
        let likes = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    likes.push(row);
                });
                res.json(likes);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining likes'
        });
    }
}

const saveLike = async(req, res = response) => {
    console.log('saveLike');
    const body = req.body;
    const idUser = body.idUser;
    const idEvent = body.idEvent;
    try {
        if ((idUser && await checkIfUserExists(idUser)) && (idEvent && await checkIfEventExists(idEvent))) {
            let query = 'INSERT INTO \`like\` VALUES (UTC_TIMESTAMP, ';
            query += '\'' + idEvent + '\', \'' + idUser + '\')';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Like created',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error saving like',
        });
    }
}

const deleteLike = async(req, res = response) => {
    const idUser = req.query.idUser;
    const idEvent = req.query.idEvent;

    try {
        if (!idUser || !(await checkIfUserExists(idUser)) || !idEvent || !(await checkIfEventExists(idEvent)) || !(await checkIfLikeExists(idUser, idEvent))) {
            return res.status(500).json({
                ok: false,
                msg: 'Like does not exist'
            });
        }

        let query = 'DELETE FROM \`like\` WHERE \`idUser\` = \'' + idUser + '\' AND \`idEvent\` = \'' + idEvent + '\'';

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    ok: true,
                    msg: 'Like deleted',
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error deleting like'
        });

    }
}

const checkIfLikeExists = (idUser, idEvent) => {
    let query = 'SELECT * FROM \`like\` WHERE idEvent=\'' + idEvent + '\' AND idUser=\'' + idUser + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfUserExists = (userId) => {
    let query = 'SELECT * FROM user WHERE id=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfEventExists = (eventId) => {
    let query = 'SELECT * FROM event WHERE id=\'' + eventId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

module.exports = {
    getLikes,
    saveLike,
    deleteLike
};