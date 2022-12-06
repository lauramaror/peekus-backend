const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const createCollage = require("../helpers/generate-collage");
const sharp = require('sharp');
const path = require('path');
const Promise = require("bluebird");

const getImages = async(req, res = response) => {
    console.log('getImages');
    const id = req.query.id || '';
    const type = req.query.type || '';
    const idEvent = req.query.idEvent || '';
    const idUserParticipant = req.query.idUserParticipant || '';
    const idUserLiked = req.query.idUserLiked || '';
    try {
        let query = 'SELECT * FROM image';
        let images = [];

        if (id || type || idEvent) {
            query += ' WHERE';
            if (id) query += ' id=\'' + id + '\'';
            if (type) query += id ? ' AND type=\'' + type + '\'' : ' type=\'' + type + '\'';
            if (idEvent) query += (id || type) ? ' AND idEvent=\'' + idEvent + '\'' : ' idEvent=\'' + idEvent + '\'';
        }

        if (idUserParticipant || idUserLiked) {
            const participatedEventIds = idUserParticipant ? (await getEventIdFromUser(idUserParticipant)) : (await getEventIdFromUserLiked(idUserLiked));
            query += ' WHERE idEvent in (\'' + participatedEventIds.flatMap(e => e.idEvent).join('\',\'') + '\') AND type=\'COLLAGE\'';
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
            if (!type || (!idEvent && !idUser) || (idUser && !(await checkIfUserExists(idUser))) || (idEvent && !(await checkIfEventExists(idEvent)))) {
                return res.status(400).json({
                    ok: false,
                    msg: `Invalid params`,
                });
            }

            let dataTruncated;
            const { data, name, size } = req.files.image;
            await sharp(data, { failOnError: false })
                .resize({ width: 1080, height: 1080, fit: sharp.fit.cover })
                .toBuffer()
                .then(data => {
                    dataTruncated = data;
                });

            const imgId = uuidv4();
            const newName = Date.now() + '.png';

            let query = 'INSERT INTO image SET ?';
            let values = {
                id: imgId,
                filename: newName,
                source: newName,
                type: type,
                idEvent: idEvent,
                idUser: idUser,
                data: dataTruncated
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

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error saving images'
        });
    }
}

const updateImage = async(req, res = response) => {
    console.log('updateImage');
    const id = req.query.id || '';
    try {
        if (!req.files) {
            res.status(500).json({
                ok: false,
                msg: 'No file uploaded'
            });
        } else {
            if (!id || (id && !(await checkIfUserExists(id)))) {
                return res.status(400).json({
                    ok: false,
                    msg: `Invalid params`,
                });
            }
            let dataTruncated;
            const { data, name, size } = req.files.image;
            await sharp(data, { failOnError: false })
                .resize({ width: 1080, height: 1080, fit: sharp.fit.cover })
                .toBuffer()
                .then(data => {
                    dataTruncated = data;
                });
            const newName = Date.now() + '.' + name.split('.')[1];

            let query = 'UPDATE image SET ? WHERE id=\'' + id + '\' AND type=\'PROFILE\'';
            let values = {
                filename: newName,
                source: newName,
                data: dataTruncated
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        imgId: imgId,
                        msg: 'Image updated'
                    });
                }
            });
        }

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error updating image'
        });
    }
}

const deleteImage = async(req, res = response) => {
    console.log('deleteImage');
    const id = req.query.id || '';
    try {

        if (!id || (id && !(await checkIfUserExists(id)))) {
            return res.status(400).json({
                ok: false,
                msg: `Invalid params`,
            });
        }

        let query = 'DELETE FROM image WHERE id=\'' + id + '\' AND type=\'PROFILE\'';

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    ok: true,
                    msg: 'Image deleted'
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error deleting image'
        });
    }
}

function createAllCollages(optionsList) {
    console.log('createAllCollages');
    const canvasArray = [];
    return Promise.each(optionsList, options => {
        return createCollage(options).then((canvas) => {
            canvasArray.push(canvas);
            return true;
        });
    }).return(canvasArray);

}

const generateCollage = async(req, res = response) => {
    console.log('generateCollage');
    const idEvent = req.query.idEvent || '';
    try {
        if (idEvent && await checkIfEventExists(idEvent)) {
            let images = (await getImagesFromEvent(idEvent)).map(i => i.data);

            // let images = [];
            // const dirname = '../../fotitos/';
            // fs.readdirSync(dirname).forEach(file => {
            //     const fileData = fs.readFileSync(path.join(dirname, file));
            //     images.push(fileData);
            // });

            console.log('images.length', images.length);
            const optionsCollages = [];
            const chunkSize = 100;
            for (let i = 0; i < images.length; i += chunkSize) {
                const chunk = images.slice(i, i + chunkSize);
                const numImages = Math.ceil(Math.sqrt(chunk.length));
                const numImagesFinal = numImages > 1 ? numImages : 2;
                console.log('numImages', chunk.length);
                const decena = Math.ceil(Math.ceil(chunk.length / 10) / 2);
                console.log('collageSize', 1080 * (decena <= 2 ? decena : 2));
                const collageSize = 1080 * (decena <= 2 ? decena : 2);
                const options = {
                    sources: chunk,
                    width: numImagesFinal, // number of images per row
                    height: numImagesFinal, // number of images per column
                    imageWidth: collageSize / numImagesFinal, // width of each image
                    imageHeight: collageSize / numImagesFinal, // height of each image
                    spacing: 1, // optional: pixels between each image
                    canvasSize: collageSize,
                };
                optionsCollages.push(options);
            }

            createAllCollages(optionsCollages).then((promises) => {
                let query = 'INSERT INTO image VALUES ?';
                const valuesToInsert = [];

                promises.forEach(p => {
                    const collageId = uuidv4();
                    const newName = Date.now() + '.jpeg';
                    let values = [collageId, newName, newName, 'collage', idEvent, null, p.toBuffer()];

                    valuesToInsert.push(values);
                });

                conexionDB(query, [valuesToInsert], function(err, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json({
                            ok: true,
                            msg: 'Collage generated',
                        });
                    }
                });
            });

        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }


    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error generating collage'
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

const getImagesFromEvent = (eventId) => {
    let query = 'SELECT * FROM image WHERE idEvent=\'' + eventId + '\' and type!=\'collage\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows);
        })
    });
}

const getEventIdFromUser = (userId) => {
    let query = 'SELECT idEvent FROM \`event_participants\` WHERE idParticipant=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows);
        })
    });
}

const getEventIdFromUserLiked = (userId) => {
    let query = 'SELECT idEvent FROM \`like\` WHERE idUser=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows);
        })
    });
}

const saveCollage = (options) => {
    return new Promise(resolve => {
        createCollage(options).then((canvas) => {
            resolve(canvas);
        })
    });
}

module.exports = {
    getImages,
    saveImage,
    generateCollage,
    updateImage,
    deleteImage
};