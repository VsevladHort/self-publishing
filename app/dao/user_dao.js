const connectionPool = require('./mysql_con_pool').pool;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

class UserDAO {
    getById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_user, pass_hash, role, user_email, user_name, banned FROM user WHERE id_user = ?;',
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

    getReadingListById(id, perPage, page) {
        if (perPage <= 0)
            perPage = 1;
        if (page <= 0)
            page = 1;
        page -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_book FROM user_reading_list WHERE id_user = ? LIMIT ? OFFSET ?;',
                [id, perPage, (page * perPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    checkIfExistsInUserReadingList(id_user, id_book) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_book FROM user_reading_list WHERE id_user = ?  AND id_book = ?;',
                [id_user, id_book],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result.length === 0) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    deleteFromReadingList(id, user_id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM user_reading_list WHERE id_book = ? AND id_user = ?;',
                [id, user_id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    addToReadingList(id, user) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO user_reading_list VALUES (?, ?);',
                [user.id_user, id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
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

    deleteById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM user WHERE id_user = ?;',
                id,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
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
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.pass_hash, salt);
            return new Promise((resolve, reject) => {
                connectionPool.query('UPDATE user SET pass_hash = ?, role = ?, user_email = ?, user_name = ?, banned = ? WHERE id_user = ?;',
                    [hash, user.role, user.user_email, user.user_name, user.banned, user.id_user],
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.affectedRows);
                        }
                    });
            });
        } else {
            return new Promise((resolve, reject) => {
                connectionPool.query('UPDATE user SET role = ?, user_email = ?, user_name = ?, banned = ? WHERE id_user = ?;',
                    [user.role, user.user_email, user.user_name, user.banned, user.id_user],
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.affectedRows);
                        }
                    });
            });
        }
    }

    async getBookmarksListById(id_user, perPage, page) {
        if (perPage <= 0)
            perPage = 1;
        if (page <= 0)
            page = 1;
        page -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_chapter FROM user_bookmarks WHERE id_user = ? LIMIT ? OFFSET ?;',
                [id_user, perPage, (page * perPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async deleteFromBookmarksList(id, id_user) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM user_bookmarks WHERE id_chapter = ? AND id_user = ?;',
                [id, id_user],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    checkIfExistsInBookmarksList(id_user, id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT id_chapter FROM user_bookmarks WHERE id_user = ?  AND id_chapter = ?;',
                [id_user, id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result.length === 0) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    async addToBookmarksList(id, user) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO user_bookmarks VALUES (?, ?, NOW());',
                [user.id_user, id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }
}

module.exports = UserDAO;