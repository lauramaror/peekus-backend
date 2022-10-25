const { response } = require('express');
const { conexionDB } = require('../helpers/configdb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { generateJWT } = require('../helpers/generatejwt');

const getUsers = async(req, res = response) => {
    console.log('getUsers');
    const id = req.query.id || '';
    try {
        let query = 'SELECT * FROM user';
        let users = [];

        if (id) {
            query += ' WHERE id=\'' + id + '\'';
        }

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                rows.forEach(row => {
                    users.push(row);
                });
                res.json(users);
            }
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error obtaining users'
        });
    }
}

const saveUser = async(req, res = response) => {
    console.log('saveUser');
    const body = req.body;
    const name = body.name;
    const username = body.username;
    const password = body.password;
    const phone = body.phone;
    const active = '1';
    const email = body.email;
    const profilePicture = body.idProfilePicture;
    try {
        if (username && !(await checkIfDuplicate(username)) && password && (phone || email)) {
            const salt = bcrypt.genSaltSync();
            const cpassword = bcrypt.hashSync(password, salt);
            const userId = uuidv4();
            let query = 'INSERT INTO \`user\` VALUES (\'' + userId + '\',';
            query += name ? '\'' + name + '\',' : null + ',';
            query += '\'' + username + '\',\'' + cpassword + '\',';
            query += phone ? '\'' + phone + '\',' : null + ',';
            query += '\'' + active + '\',';
            query += email ? '\'' + email + '\',' : null + ',';
            query += profilePicture ? '\'' + profilePicture + '\');' : null + ');';

            const tokenUser = await generateJWT(userId);

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'User created',
                        id: userId,
                        token: tokenUser
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            ok: false,
            msg: 'Error saving user',
        });
    }
}

const checkIfDuplicate = (usernameToCheck, id) => {
    let query = 'SELECT * FROM user WHERE username=\'' + usernameToCheck + '\' AND id != \'' + id + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

const updateUser = async(req, res = response) => {
    console.log('updateUser');
    const body = req.body;
    const id = req.query.id;
    const name = body.name;
    const username = body.username;
    const password = body.password;
    const phone = body.phone;
    const email = body.email;
    try {
        if ((id && await checkIfExists(id)) && (!username || (username && !(await checkIfDuplicate(username)))) && password && (phone || email)) {
            let query = 'UPDATE \`user\` SET \`name\`=' + (name ? '\'' + name + '\',' : null + ',');
            query += (username ? '\`username\`=\'' + username + '\',' : '');
            query += '\`password\`=\'' + password + '\',';
            query += '\`phone\`=' + (phone ? '\'' + phone + '\',' : null + ',');
            query += '\`email\`=' + (email ? '\'' + email + '\'' : null);
            query += ' WHERE id=\'' + id + '\'';

            conexionDB(query, function(err, rows) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        ok: true,
                        msg: 'User updated',
                    });
                }
            });
        } else {
            response.send("Invalid parameters");
            response.end();
            return;
        }

    } catch (err) {
        res.status(500).json({
            ok: false,
            msg: 'Error updating user',
        });
    }
}

const deleteUser = async(req, res = response) => {
    const id = req.query.id;

    try {
        if (!id || (id && !(await checkIfExists(id)))) {
            return res.status(500).json({
                ok: false,
                msg: 'User does not exist'
            });
        }

        let query = 'DELETE FROM \`user\` WHERE \`id\` = \'' + id + '\';'

        conexionDB(query, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    ok: true,
                    msg: 'User deleted',
                });
            }
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Error deleting user'
        });

    }
}

const checkIfExists = (userId) => {
    let query = 'SELECT * FROM user WHERE id=\'' + userId + '\'';
    return new Promise(resolve => {
        conexionDB(query, function(err, rows) {
            resolve(rows.length > 0);
        })
    });
}

module.exports = {
    getUsers,
    saveUser,
    deleteUser,
    updateUser
};