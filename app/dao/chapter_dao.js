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

    getNextChapterForBook(id_book, datetime_published) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE id_book = ?
                                  AND public = true
                                  AND datetime_published > ?
                                  ORDER BY datetime_published ASC
                                  LIMIT 1;`,
                [id_book, datetime_published],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    getPrevChapterForBook(id_book, datetime_published) {
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE id_book = ?
                                  AND public = true
                                  AND datetime_published < ?
                                  ORDER BY datetime_published DESC
                                  LIMIT 1;`,
                [id_book, datetime_published],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }

    getAllOrderByDateWhereBookIsWithPagination(id_book, numPerPage, numOfPage) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE id_book = ?
                                  ORDER BY datetime_published 
                                  ASC 
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

    async getChaptersForBookFilteredByPublic(id_book, numPerPage, numOfPage) {
        if (numPerPage <= 0)
            numPerPage = 1;
        if (numOfPage <= 0)
            numOfPage = 1;
        numOfPage -= 1;
        return new Promise((resolve, reject) => {
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE id_book = ?
                                  AND public = true
                                  ORDER BY datetime_published 
                                  ASC 
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
            connectionPool.query('UPDATE chapter SET chapter_title = ?, chapter_text = ?, datetime_published = ?, datetime_updated = NOW(), public = ?, id_book = ? WHERE id_chapter = ?;',
                [chapter.chapter_title, chapter.chapter_text,
                    chapter.datetime_published,
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

    async getListById(id) {
        return new Promise((resolve, reject) => {
            const placeholders = id.map(() => '?').join(',');
            connectionPool.query(`SELECT id_chapter, chapter_title, chapter_text, datetime_published, datetime_updated, public, id_book
                                  FROM chapter
                                  WHERE public = true
                                  AND id_chapter IN (${placeholders})`,
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

    async createReport(id_user, id_chapter, report_content) {
        return new Promise((resolve, reject) => {
            connectionPool.query('INSERT INTO chapter_report VALUES (?, ?, ?);',
                [id_user, id_chapter, report_content],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    async readReport(id_user, id_chapter) {
        return new Promise((resolve, reject) => {
            connectionPool.query('SELECT * FROM chapter_report WHERE id_user = ? AND id_chapter = ?',
                [id_user, id_chapter],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result[0]);
                    }
                });
        });
    }
}

module.exports = ChapterDAO;