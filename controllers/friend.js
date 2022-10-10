const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getFriends = async(req, res = response) => {
    console.log('getFriends');
    try {
        let query = 'SELECT * FROM friend';
        let friends = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    friends.push(row);
                });
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

module.exports = {
    getFriends
};