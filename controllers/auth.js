const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/generatejwt');
const jwt = require("jsonwebtoken");

const token = async(req, res = response) => {
    const token = req.headers["token"];

    try {
        const { id, ...object } = jwt.verify(token, process.env.JWTSECRET);

        const userDB = await checkIfExists(id);

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: "Invalid token"
            });
        }

        const newToken = await generateJWT(userDB.id);

        res.json({
            ok: true,
            msg: "token",
            id: userDB.id,
            name: userDB.name,
            username: userDB.username,
            profilePic: userDB.profilePicture,
            token: newToken,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Invalid token",
            token: "",
        });
    }
}

const login = async(req, res = response) => {
    const { userData, password } = req.body;

    try {
        const userDB = await checkIfExists(userData);

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: "User does not exist"
            });
        }

        const validPassword = bcrypt.compareSync(password, userDB.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: "User or password not correct"
            });
        }

        const token = await generateJWT(userDB.id);

        res.json({
            ok: true,
            msg: "login",
            id: userDB.id,
            name: userDB.name,
            username: userDB.username,
            profilePic: userDB.profilePicture,
            token: token,
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: "Login error",
            token: "",
        });
    }
}

const checkIfExists = (userData) => {
    let query = 'SELECT * FROM user WHERE username=\'' + userData + '\' OR phone=\'' + userData + '\' OR email=\'' + userData + '\' OR id=\'' + userData + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length ? rows[0] : null);
        })
    });
}

module.exports = {
    login,
    token
};