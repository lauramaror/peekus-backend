const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getComments = async(req, res = response) => {
    console.log('getComments');
    try {
        let query = 'SELECT * FROM comment';
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