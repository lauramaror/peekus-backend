const jwt = require("jsonwebtoken");

const generateJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = {
            id: uid
        };

        const expiration = {
            expiresIn: "60d"
        }

        jwt.sign(
            payload,
            process.env.JWTSECRET,
            expiration,
            (err, token) => {
                if (err) {
                    console.error(err);
                    reject("JWT could not be generated");
                } else {
                    resolve(token);
                }
            }
        );
    });
};

module.exports = { generateJWT };