const connectionPool = require('./mysql_con_pool').pool;

class ReviewDAO {
    getById(id_user, id_book) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT * 
                                  FROM review b 
                                  NATURAL JOIN rating r 
                                  WHERE id_book = ?
                                  AND id_user = ?;`,
                [id_book, id_user],
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

    deleteById(id_user, id_book) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM review WHERE id_book = ? AND id_user = ?;',
                [id_book, id_user],
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
            connectionPool.query(`SELECT *
                                  FROM review b 
                                  NATURAL JOIN rating r
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
            connectionPool.query(`SELECT *
                                  FROM review b 
                                  NATURAL JOIN rating r
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

    getAllOrderByDateWithPagination(numPerPage, numOfPage, id_book) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT *
                                  FROM review b 
                                  NATURAL JOIN rating r
                                  WHERE id_book = ?
                                  ORDER BY b.datetime_published 
                                  DESC 
                                  LIMIT ? 
                                  OFFSET ?;`,
                [id_book, numPerPage, (numOfPage * numPerPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async create(review) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO review VALUES (?, NOW(), NOW(), true, ?, ?);',
                [review.text_review, review.id_user, review.id_book],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    async update(review) {
        return new Promise((resolve, reject) => {
            connectionPool.query('UPDATE review SET text_review = ?, datetime_published = ?, datetime_updated = NOW(), public = ? WHERE id_user = ? AND id_book = ?;',
                [review.text_review, review.datetime_published, review.public, review.id_user, review.id_book],
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

module.exports = ReviewDAO;