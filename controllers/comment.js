const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

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

module.exports = {
    getComments
};