const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { v4: uuidv4 } = require('uuid');

const getComments = async(req, res = response) => {
    const id = req.query.id || '';
    const idEvent = req.query.idEvent || '';
    const user = req.query.user || '';
    console.log('getComments');
    try {
        let query = 'SELECT c.*, u.name, u.username FROM comment c LEFT OUTER JOIN user u ON c.idUser = u.id ';
        if (id) query += 'WHERE id = \'' + id + '\'';
        if (idEvent) query += id ? ' AND idEvent = \'' + idEvent + '\'' : 'WHERE idEvent = \'' + idEvent + '\'';
        if (user) query += (id || idEvent) ? ' AND user = \'' + user + '\'' : 'WHERE user = \'' + user + '\'';
        let comments = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    comments.push(row);
                });
                res.json(comments);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining comments'
        });
    }
}

const saveComment = async(req, res = response) => {
    console.log('saveComment');
    const body = req.body;
    const text = body.text;
    const idUser = body.idUser;
    const idEvent = body.idEvent;
    try {
        if ((text && text !== '') && (idUser && await checkIfUserExists(idUser)) && (idEvent && await checkIfEventExists(idEvent))) {
            let query = 'INSERT INTO \`comment\` VALUES (\'' + uuidv4() + '\', \'' + text + '\', ';
            query += 'UTC_TIMESTAMP, ';
            query += '\'' + idUser + '\', \'' + idEvent + '\')';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Comment created',
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
            msg: 'Error saving comment',
        });
    }
}

const deleteComment = async(req, res = response) => {
    const id = req.query.id;

    try {
        if (!id || (id && !(await checkIfCommentExists(id)))) {
            return res.status(500).json({
                ok: false,
                msg: 'Comment does not exist'
            });
        }

        let query = 'DELETE FROM \`comment\` WHERE \`id\` = \'' + id + '\';'

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    ok: true,
                    msg: 'Comment deleted',
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error deleting comment'
        });

    }
}

const checkIfCommentExists = (commentId) => {
    let query = 'SELECT * FROM comment WHERE id=\'' + commentId + '\'';
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
    getComments,
    saveComment,
    deleteComment
};