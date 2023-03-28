const connectionPool = require('./mysql_con_pool').pool;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

class BookDAO {
    getById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b 
                                  LEFT JOIN rating r 
                                  ON b.id_book = r.id_book 
                                  WHERE b.id_book = ?
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published;`,
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

    deleteById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query('DELETE FROM book WHERE id_book = ?;',
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

    getAllOrderByDateWithPagination(numPerPage, numOfPage) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b LEFT JOIN rating r ON b.id_book = r.id_book GROUP BY b.id_book, b.author, b.book_title, b.date_published 
                                  ORDER BY date_published 
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

    //SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score FROM book b LEFT JOIN rating r ON b.id_book = r.id_book GROUP BY b.id_book, b.author, b.book_title, b.date_published ORDER BY avg_score, b.date_published DESC;

    getAllOrderedByAvgScoreThenDateWithPagination(numPerPage, numOfPage) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b 
                                  LEFT JOIN rating r 
                                  ON b.id_book = r.id_book 
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published 
                                  ORDER BY avg_score, b.date_published DESC 
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

    getAllOrderedByAvgScoreThenDateWithPaginationWhereTitleIsLike(numPerPage, numOfPage, likeString) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b 
                                  LEFT JOIN rating r 
                                  ON b.id_book = r.id_book 
                                  WHERE b.book_title IS LIKE ? 
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published 
                                  ORDER BY avg_score, b.date_published DESC 
                                  LIMIT ? 
                                  OFFSET ?;`,
                ['%' + likeString + '%', numPerPage, (numOfPage * numPerPage)],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async create(book) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO book VALUES (NULL, ?, ?, NOW());',
                [book.author, book.book_title],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
                    }
                });
        });
    }

    async update(book) {
        return new Promise((resolve, reject) => {
            connectionPool.query('UPDATE book SET author = ?, book_title = ?, date_published = ? WHERE id_book = ?;',
                [book.author, book.book_title, book.date_published, book.id_book],
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

module.exports = BookDAO;