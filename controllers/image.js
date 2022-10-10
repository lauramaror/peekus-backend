const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');

const getImages = async(req, res = response) => {
    console.log('getImages');
    try {
        let query = 'SELECT * FROM image';
        let images = [];

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    images.push(row);
                });
                res.json(images);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining images'
        });
    }
}

module.exports = {
    getImages
};