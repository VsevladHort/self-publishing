const bookModel = require('../dao/book_dao');
const userModel = require('../dao/user_dao');
const chapterModel = require('../dao/chapter_dao');
const bookDAO = new bookModel();
const userDAO = new userModel();
const chapterDAO = new chapterModel();

const createChapter = async function (chapter) {
    const id = await chapterDAO.create({
        chapter_title: chapter.chapter_title,
        chapter_text: chapter.chapter_text,
        id_book: chapter.id_book
    });
    return await chapterDAO.getById(id);
}

const getById = async function (id) {
    return await chapterDAO.getById(id);
};

module.exports = {createChapter, getById};