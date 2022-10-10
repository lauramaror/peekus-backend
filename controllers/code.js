const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getCodes = async(req, res = response) => {
    console.log('getCodes');
    try {
        let query = 'SELECT * FROM code';
        let codes = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    codes.push(row);
                });
                res.json(codes);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining codes'
        });
    }
}

module.exports = {
    getCodes
};