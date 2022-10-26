const { response } = require("express");
const jwt = require("jsonwebtoken");

const validateJWT = (req, res = response, next) => {
    const token = req.header("token") || req.query.token;

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: "Auth token is missing",
        });
    }

    try {
        jwt.verify(token, process.env.JWTSECRET);

        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: "Invalid token",
        });
    }
};

module.exports = { validateJWT };