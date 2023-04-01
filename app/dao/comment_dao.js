const connectionPool = require('./mysql_con_pool').pool;

class CommentDAO {
    getById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_comment, text_comment, datetime_published, datetime_updated, public, id_user, id_chapter, user_name
                                  FROM comment b 
                                  NATURAL JOIN user r 
                                  WHERE id_comment = ?;`,
                [id],
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
            connectionPool.query('DELETE FROM comment WHERE id_comment = ?;',
                [id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    getAllOrderByDateWithPaginationWhereAuthorIs(numPerPage, numOfPage, author) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_comment, text_comment, datetime_published, datetime_updated, public, id_user, id_chapter, user_name
                                  FROM comment b 
                                  NATURAL JOIN user r 
                                  WHERE id_user = ?
                                  ORDER BY b.datetime_published 
                                  DESC 
                                  LIMIT ? 
                                  OFFSET ?;`,
                [parseInt(author), numPerPage, (numOfPage * numPerPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    getAllOrderByDateWithPaginationPublicFiltered(numPerPage, numOfPage) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_comment, text_comment, datetime_published, datetime_updated, public, id_user, id_chapter, user_name
                                  FROM comment b 
                                  NATURAL JOIN user r 
                                  WHERE public = true
                                  ORDER BY b.datetime_published 
                                  DESC 
                                  LIMIT ? 
                                  OFFSET ?;`,
                [numPerPage, (numOfPage * numPerPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    getAllOrderByDateWithPaginationWhereIdChapterIs(numPerPage, numOfPage, id_chapter) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_comment, text_comment, datetime_published, datetime_updated, public, id_user, id_chapter, user_name
                                  FROM comment b 
                                  NATURAL JOIN user r 
                                  WHERE id_chapter = ?
                                  ORDER BY b.datetime_published 
                                  DESC 
                                  LIMIT ? 
                                  OFFSET ?;`,
                [id_chapter, numPerPage, (numOfPage * numPerPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async create(comment) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO comment VALUES (NULL, ?, NOW(), NOW(), true, ?, ?);',
                [comment.text_comment, comment.id_user, comment.id_chapter],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
                    }
                });
        });
    }

    async createReport(id_user, id_comment, report_content) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO comment_report VALUES (?, ?, ?);',
                [id_user, id_comment, report_content],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    async readReport(id_user, id_comment) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT * FROM comment_report WHERE id_user = ? AND id_comment = ?;',
                [id_user, id_comment],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    async deleteReportByIds(id_user, id_comment) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM comment_report WHERE id_user = ? AND id_comment = ?;',
                [id_user, id_comment],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    async getReportsForComments(number, page) {
        if (number <= 0)
            number = 1;
        if (page <= 0)
            page = 1;
        page -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT * FROM comment_report LIMIT ? OFFSET ?;',
                [number, (page * number)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async update(comment) {
        return new Promise((resolve, reject) => {
            connectionPool.query('UPDATE comment SET text_comment = ?, datetime_published = ?, datetime_updated = NOW(), public = ? WHERE id_comment = ?;',
                [comment.text_comment, comment.datetime_published, comment.public, comment.id_comment],
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

module.exports = CommentDAO;