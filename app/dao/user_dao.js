const connectionPool = require('./mysql_con_pool').pool;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

class UserDAO {
    getById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_user, pass_hash, role, user_email, user_name, banned FROM user WHERE user_id = ?;',
                id,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result.length === 0) {
                        resolve(null);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    getByEmail(email) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_user, pass_hash, role, user_email, user_name, banned FROM user WHERE user_email = ?;',
                email,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result.length === 0) {
                        resolve(null);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    getAllLimitedBy(number) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_user, role, user_email, user_name, banned FROM user LIMIT ?;',
                number,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async create(user) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.pass_hash, salt);
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO user VALUES (NULL, ?, ?, ?, ?, 0);',
                [hash, user.role, user.user_email, user.user_name],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
                    }
                });
        });
    }

    async update(user) {
        if (user.pass_hash) {
            let hash = await bcrypt.hash(user.pass_hash, process.env.SALT_ROUNDS);
            return new Promise((resolve, reject) => {
                connectionPool.query('UPDATE users SET pass_hash = ?, role = ?, user_email = ?, user_name = ?, banned = ? WHERE id_user = ?;',
                    [hash, user.role, user.user_email, user.user_name, user.banned, user.id_user],
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.insertId);
                        }
                    });
            });
        } else {
            return new Promise((resolve, reject) => {
                connectionPool.query('UPDATE users SET role = ?, user_email = ?, user_name = ?, banned = ? WHERE id_user = ?;',
                    [user.role, user.user_email, user.user_name, user.banned, user.id_user],
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.insertId);
                        }
                    });
            });
        }
    }
}

module.exports = UserDAO;