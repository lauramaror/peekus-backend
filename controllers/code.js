const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { isStringInEnum, CODE_TYPE } = require('../helpers/enums');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
// const { QRCodeStyling } = require('qr-code-styling');
const { QRCodeStyling } = require("qr-code-styling-node/lib/qr-code-styling.common.js");
const nodeCanvas = require("canvas");
const { PEEKUS_LOGO } = require('../helpers/constants');

const getCodes = async(req, res = response) => {
    const id = req.query.id || '';
    const idEvent = req.query.idEvent || '';
    const type = req.query.type || '';
    const content = req.query.content || '';
    console.log('getCodes');
    try {
        let query = 'SELECT * FROM code';
        if (id) query += ' WHERE id = \'' + id + '\'';
        if (idEvent) query += id ? ' AND idEvent = \'' + idEvent + '\'' : ' WHERE idEvent = \'' + idEvent + '\'';
        if (type) query += (id || idEvent) ? ' AND type = \'' + type + '\'' : ' WHERE type = \'' + type + '\'';
        if (content) query += (id || idEvent || type) ? ' AND content = \'' + content + '\'' : ' WHERE content = \'' + content + '\'';
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

const saveCode = async(req, res = response) => {
    console.log('saveCode');
    const body = req.body;
    const content = body.codeContent;
    const type = body.type;
    const idEvent = body.idEvent;
    try {
        if ((content && content !== '') && (type && isStringInEnum(type, CODE_TYPE)) && (idEvent && await checkIfEventExists(idEvent))) {
            const idCode = uuidv4();
            // let query = 'INSERT INTO \`code\` VALUES (\'' + idCode + '\', \'' + content + '\', 1, ';
            // query += '\'' + idEvent + '\', \'' + type + '\')';

            let query = 'INSERT INTO code SET ?';
            let values = {
                id: idCode,
                content: content,
                active: 1,
                type: type,
                idEvent: idEvent,
                dataQR: null
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Code created',
                        idCode: idCode
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
            msg: 'Error saving code',
        });
    }
}

const updateCode = async(req, res = response) => {
    console.log('updateCode');
    const id = req.query.id;
    const body = req.body;
    const content = body.codeContent;
    try {
        if ((id && await checkIfCodeExists(id)) && (content && content !== '')) {

            let query = 'UPDATE code SET ? WHERE id=\'' + id + '\'';
            let values = {
                content: content
            };

            conexionDB(query, [values], function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Code updated'
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
            msg: 'Error updating code',
        });
    }
}

const deleteCode = async(req, res = response) => {
    console.log('deleteCode');
    const id = req.query.id;
    try {
        if ((id && await checkIfCodeExists(id))) {

            let query = 'DELETE FROM code WHERE id=\'' + id + '\'';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'Code deleted'
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
            msg: 'Error deleting code',
        });
    }
}

const generateQR = async(req, res = response) => {
    console.log('generateQR');
    const idEvent = req.query.idEvent || '';
    try {
        if (idEvent && await checkIfEventExists(idEvent)) {
            const idCode = uuidv4();

            // let data = "https://www.google.es/";

            // let stringdata = JSON.stringify(data);

            const options = {
                width: 300,
                height: 300,
                data: "https://www.google.es/",
                margin: 0,
                qrOptions: {
                    typeNumber: "0",
                    mode: "Byte",
                    errorCorrectionLevel: "Q"
                },
                imageOptions: {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0
                },
                dotsOptions: {
                    type: "rounded",
                    color: "#78d98f",
                    gradient: null
                },
                backgroundOptions: {
                    color: "#ffffff"
                },
                image: PEEKUS_LOGO,
                dotsOptionsHelper: {
                    colorType: {
                        single: true,
                        gradient: false
                    },
                    gradient: {
                        linear: true,
                        radial: false,
                        color1: "#6a1a4c",
                        color2: "#6a1a4c",
                        rotation: "0"
                    }
                },
                cornersSquareOptions: {
                    type: "extra-rounded",
                    color: "#1b1c1e"
                },
                cornersSquareOptionsHelper: {
                    colorType: {
                        single: true,
                        gradient: false
                    },
                    gradient: {
                        linear: true,
                        radial: false,
                        color1: "#000000",
                        color2: "#000000",
                        rotation: "0"
                    }
                },
                cornersDotOptions: {
                    type: "",
                    color: "#1b1c1e"
                },
                cornersDotOptionsHelper: {
                    colorType: {
                        single: true,
                        gradient: false
                    },
                    gradient: {
                        linear: true,
                        radial: false,
                        color1: "#000000",
                        color2: "#000000",
                        rotation: "0"
                    }
                },
                backgroundOptionsHelper: {
                    colorType: {
                        single: true,
                        gradient: false
                    },
                    gradient: {
                        linear: true,
                        radial: false,
                        color1: "#ffffff",
                        color2: "#ffffff",
                        rotation: "0"
                    }
                }
            }

            const qrCodeImage = new QRCodeStyling({
                nodeCanvas,
                ...options
            });

            qrCodeImage.getRawData("png").then((buffer) => {
                let query = 'INSERT INTO code SET ?';
                let values = {
                    id: idCode,
                    content: null,
                    active: 1,
                    type: 'qr',
                    idEvent: idEvent,
                    dataQR: buffer
                };

                conexionDB(query, [values], function(err, rows) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.json({
                            ok: true,
                            msg: 'Code created',
                            idCode: idCode
                        });
                    }
                });
            });


            // QRCode.toDataURL('https://www.google.es/', async function(err, code) {
            //     if (err) return console.log("error occurred")

            //     console.log(code);

            //     const blob = Buffer.from(code.split(',')[1], 'base64');

            //     let query = 'INSERT INTO code SET ?';
            //     let values = {
            //         id: idCode,
            //         content: null,
            //         active: 1,
            //         type: 'qr',
            //         idEvent: idEvent,
            //         dataQR: blob
            //     };

            //     conexionDB(query, [values], function(err, rows) {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             res.json({
            //                 ok: true,
            //                 msg: 'Code created',
            //                 idCode: idCode
            //             });
            //         }
            //     });
            // });

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
            msg: 'Error saving code',
        });
    }
}

const checkIfEventExists = (eventId) => {
    let query = 'SELECT * FROM event WHERE id=\'' + eventId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const checkIfCodeExists = (codeId) => {
    let query = 'SELECT * FROM code WHERE id=\'' + codeId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

module.exports = {
    getCodes,
    saveCode,
    generateQR,
    updateCode,
    deleteCode
};