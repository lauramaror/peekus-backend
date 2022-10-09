const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getUsers = async(req, res = response) => {

    try {
        let query = 'SELECT * FROM user';
        let users = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    users.push(row);
                });
                res.json(users);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining users'
        });
    }
}

module.exports = {
    getUsers
};