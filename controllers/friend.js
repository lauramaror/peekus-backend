const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { FRIEND_STATUS, isStringInEnum } = require('../helpers/enums');

const getFriends = async(req, res = response) => {
    const id = req.query.id || '';
    const status = req.query.status || '';
    console.log('getFriends');
    try {
        let query = 'SELECT * FROM friend ';
        if (id) query += 'WHERE (idSolicitant = \'' + id + '\' OR idReceptor= \'' + id + '\')';
        if (status) query += id ? ' AND status = \'' + status + '\'' : 'WHERE status = \'' + status + '\'';
        let friends = [];

        conexionDB(query, async function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                for await (const row of rows) {
                    const userData = row.idSolicitant === id ? await getUser(row.idReceptor) : await getUser(row.idSolicitant);
                    row['friendData'] = userData;
                    friends.push(row);
                }

                res.json(friends);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining friends'
        });
    }
}

const saveFriend = async(req, res = response) => {
    console.log('saveFriend');
    const body = req.body;
    const idReceptor = body.idReceptor;
    const idSolicitant = body.idSolicitant;
    try {
        if ((idReceptor && await checkIfUserExists(idReceptor)) && (idSolicitant && await checkIfUserExists(idSolicitant)) && (await checkIfFriends(idSolicitant, idReceptor))) {

            let query = 'INSERT INTO friend SET ?';
            let values = {
                idSolicitant: idSolicitant,
                idReceptor: idReceptor,
                status: 'PENDING'
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Friend request created',
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
            msg: 'Error saving friend',
        });
    }
}

const updateFriend = async(req, res = response) => {
    console.log('updateFriend');
    const body = req.body;
    const idReceptor = body.idReceptor;
    const idSolicitant = body.idSolicitant;
    const status = body.status;
    try {
        if ((idReceptor && await checkIfUserExists(idReceptor)) && (idSolicitant && await checkIfUserExists(idSolicitant)) && (status && isStringInEnum(status, FRIEND_STATUS)) && !(await checkIfFriends(idSolicitant, idReceptor))) {

            let query = 'UPDATE friend SET ? WHERE idSolicitant = \'' + idSolicitant + '\' AND idReceptor= \'' + idReceptor + '\'';
            let values = {
                status: status
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Friend request updated',
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
            msg: 'Error updating friend',
        });
    }
}

const deleteFriend = async(req, res = response) => {
    console.log('deleteFriend');
    const idReceptor = req.query.idReceptor;
    const idSolicitant = req.query.idSolicitant;
    try {
        if ((idReceptor && await checkIfUserExists(idReceptor)) && (idSolicitant && await checkIfUserExists(idSolicitant)) && !(await checkIfFriends(idSolicitant, idReceptor))) {

            let query = 'DELETE FROM friend WHERE idSolicitant = \'' + idSolicitant + '\' AND idReceptor= \'' + idReceptor + '\'';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Friend deleted',
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
            msg: 'Error deleting friend',
        });
    }
}

const checkIfFriends = (idSolicitant, idReceptor) => {
    let query = 'SELECT * FROM friend WHERE idSolicitant = \'' + idSolicitant + '\' AND idReceptor= \'' + idReceptor + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length == 0);
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

const getUser = (userId) => {
    let query = 'SELECT name, username, idProfilePicture FROM user WHERE id=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows);
        })
    });
}

module.exports = {
    getFriends,
    saveFriend,
    updateFriend,
    deleteFriend
};