const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { isStringInEnum, CODE_TYPE } = require('../helpers/enums');
const { v4: uuidv4 } = require('uuid');

const getCodes = async(req, res = response) => {
    const id = req.query.id || '';
    const idEvent = req.query.idEvent || '';
    const type = req.query.type || '';
    const content = req.query.content || '';
    console.log('getCodes');
    try {
        let query = 'SELECT * FROM code';
        if (id) query += 'WHERE id = \'' + id + '\'';
        if (idEvent) query += id ? ' AND idEvent = \'' + idEvent + '\'' : 'WHERE idEvent = \'' + idEvent + '\'';
        if (type) query += (id || idEvent) ? ' AND type = \'' + type + '\'' : 'WHERE type = \'' + type + '\'';
        if (content) query += (id || idEvent || type) ? ' AND content = \'' + content + '\'' : 'WHERE content = \'' + content + '\'';
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
            let query = 'INSERT INTO \`code\` VALUES (\'' + idCode + '\', \'' + content + '\', 1, ';
            query += '\'' + idEvent + '\', \'' + type + '\')';

            conexionDB(query, function(err, rows) {
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

const checkIfEventExists = (eventId) => {
    let query = 'SELECT * FROM event WHERE id=\'' + eventId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

module.exports = {
    getCodes,
    saveCode
};