const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const getImages = async(req, res = response) => {
    console.log('getImages');
    const id = req.query.id || '';
    const type = req.query.type || '';
    const idEvent = req.query.idEvent || '';
    try {
        let query = 'SELECT * FROM image';
        let images = [];

        if (id || type || idEvent) {
            query += ' WHERE';
            if (id) query += ' id=\'' + id + '\'';
            if (type) query += id ? ' AND type in (' + type + ')' : ' e.type in (' + type + ')';
            if (idEvent) query += (id || type) ? ' AND idEvent=\'' + idEvent + '\'' : ' idEvent=\'' + idEvent + '\'';
        }

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

const saveImage = async(req, res = response) => {
    console.log('saveImage');
    const type = req.query.type || '';
    const idEvent = req.query.idEvent || null;
    const idUser = req.query.idUser || null;
    try {
        if (!req.files) {
            res.status(500).json({
                ok: false,
                msg: 'No file uploaded'
            });
        } else {
            if (req.files.image.truncated) {
                return res.status(400).json({
                    ok: false,
                    msg: `Max file size is 5MB`,
                });
            }
            if (!type || (!idEvent && !idUser) || (idUser && !(await checkIfUserExists(idUser))) || (idEvent && !(await checkIfEventExists(idEvent)))) {
                return res.status(400).json({
                    ok: false,
                    msg: `Invalid params`,
                });
            }
            const { data, name, size } = req.files.image;
            const imgId = uuidv4();
            const newName = Date.now() + '.' + name.split('.')[1];

            let query = 'INSERT INTO image SET ?';
            let values = {
                id: imgId,
                filename: newName,
                source: newName,
                type: type,
                idEvent: idEvent,
                idUser: idUser,
                data: data.slice(0, size)
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        imgId: imgId,
                        msg: 'Image created'
                    });
                }
            });
        }
        // if (!req.file) {
        //     console.log("No file upload");
        //     res.status(500).json({
        //         ok: false,
        //         msg: 'No file upload'
        //     });
        // } else {
        //     console.log(req.file);
        //     const imgId = uuidv4();
        //     var imgsrc = 'uploads/' + req.file.filename;

        //     let query = 'INSERT INTO image VALUES(\'' + imgId + '\',\'' + req.file.filename + '\',?,\'event\',' + null + ',' + null + ',' + null + ')';

        //     res.json({
        //         ok: true,
        //         msg: 'pruebita'
        //     });

        //     // conexionDB(query, [imgsrc], function(err, rows) {
        //     //     if (err) {
        //     //         console.log(err);
        //     //     } else {
        //     //         res.json({
        //     //             ok: true,
        //     //             msg: 'Image created'
        //     //         });
        //     //     }
        //     // });
        // }

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error saving images'
        });
    }
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
    getImages,
    saveImage
};