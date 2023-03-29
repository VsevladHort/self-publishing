const connectionPool = require('./mysql_con_pool').pool;
const dotenv = require('dotenv').config();

class ChapterDAO {
    getById(id) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE id_chapter = ?;`,
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
            connectionPool.query('DELETE FROM chapter WHERE id_chapter = ?;',
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
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  ORDER BY datetime_published 
                                  ASC 
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

    async create(chapter) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO chapter VALUES (NULL, ?, ?, NOW(), NOW(), true, ?);',
                [chapter.chapter_title, chapter.chapter_text, chapter.id_book],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.insertId);
                    }
                });
        });
    }

    async update(chapter) {
        return new Promise((resolve, reject) => {
            connectionPool.query('UPDATE chapter SET chapter_title = ?, chapter_text = ?, datetime_published = ?, datetime_updated = ?, public = ?, id_book = ? WHERE id_chapter = ?;',
                [chapter.chapter_title, chapter.chapter_text,
                    chapter.datetime_published, chapter.datetime_updated,
                    chapter.public, chapter.id_book, chapter.id_chapter],
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

module.exports = ChapterDAO;