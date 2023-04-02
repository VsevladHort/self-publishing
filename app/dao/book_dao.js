const connectionPool = require('./mysql_con_pool').pool;
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

    getListById(id) {
        return new Promise((resolve, reject) => {
            const placeholders = id.map(() => '?').join(',');
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b 
                                  LEFT JOIN rating r 
                                  ON b.id_book = r.id_book 
                                  WHERE b.id_book IN (${placeholders})
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published;`,
                id,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
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

    getAllOrderByDateWithPaginationWhereAuthorIs(numPerPage, numOfPage, author) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
                                  FROM book b LEFT JOIN rating r ON b.id_book = r.id_book 
                                  WHERE b.author = ?
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published 
                                  ORDER BY date_published 
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
                                  ORDER BY avg_score DESC, date_published 
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
                                  WHERE b.book_title LIKE ? 
                                  GROUP BY b.id_book, b.author, b.book_title, b.date_published 
                                  ORDER BY avg_score DESC, date_published 
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

    getAllOrderedByAvgScoreThenDateWithPaginationWhereTitleIsLikeAndHasTags(numPerPage, numOfPage, likeString, tagArray) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        const placeholders = tagArray.map(() => '?').join(',');
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT b.id_book, b.author, b.book_title, b.date_published, AVG(COALESCE(r.score, 0)) AS avg_score 
FROM book b 
LEFT JOIN rating r 
ON b.id_book = r.id_book 
LEFT OUTER JOIN book_tags ON b.id_book = book_tags.id_book
LEFT OUTER JOIN tag t ON book_tags.id_tag = t.id_tag
WHERE b.book_title LIKE ? 
AND t.tag_name IN (?)
GROUP BY b.id_book, b.author, b.book_title, b.date_published 
HAVING COUNT(DISTINCT t.tag_name) >= ?
ORDER BY avg_score DESC, b.date_published 
LIMIT ?
OFFSET ?;`,
                ['%' + likeString + '%', tagArray, tagArray.length, numPerPage, (numOfPage * numPerPage)],
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

    async getAllTagsOfBook(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_tag, tag_name
                                  FROM tag 
                                  NATURAL JOIN book_tags
                                  WHERE id_book = ?
                                  ORDER BY tag_name;`,
                [id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async checkIfExistsForBook(id_book, id_tag) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT *
                                  FROM book_tags
                                  WHERE id_book = ?
                                  AND id_tag = ?;`,
                [id_book, id_tag],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    async getAllTags() {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_tag, tag_name
                                  FROM tag 
                                  ORDER BY tag_name;`,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async getTag(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_tag, tag_name
                                  FROM tag 
                                  WHERE id_tag = ?`,
                [id],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
        });
    }

    async addTagToBook(id_book, id_tag) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`INSERT INTO book_tags VALUE(?, ?)`,
                [id_book, id_tag],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    async removeTagFromBook(id_book, id_tag) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`DELETE FROM book_tags WHERE id_book = ? AND id_tag = ?;`,
                [id_book, id_tag],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.affectedRows);
                    }
                });
        });
    }

    async addTag(name) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`INSERT INTO tag VALUES(NULL, ?);`,
                [name],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
                    }
                });
        });
    }

    async removeTag(name) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`DELETE FROM tag WHERE id_tag = ?`,
                [name],
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