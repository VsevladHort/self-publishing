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

async function getChaptersForBook(id_book, numChapters, page) {
    return await chapterDAO.getAllOrderByDateWhereBookIsWithPagination(id_book, numChapters, page)
}

async function getNextChapterForBook(id_book, datetime_published) {
    return await chapterDAO.getNextChapterForBook(id_book, datetime_published);
}

async function getPrevChapterForBook(id_book, datetime_published) {
    return await chapterDAO.getPrevChapterForBook(id_book, datetime_published);
}

// returns whether the chapter has been successfully updated
const edit = async function (id, chapter) {
    let chap = await chapterDAO.getById(id);
    if (chap) {
        chap.chapter_title = chapter.chapter_title;
        chap.chapter_text = chapter.chapter_text;
        chap.public = chapter.public;
        return await chapterDAO.update(chap);
    }
    return chap;
};

// returns whether the chapter has been successfully deleted
const deleteChapter = async function (id) {
    let chap = await chapterDAO.getById(id);
    if (chap) {
        return await chapterDAO.deleteById(id);
    }
    return chap;
};

module.exports = {
    createChapter,
    getById,
    getChaptersForBook,
    getNextChapterForBook,
    edit,
    deleteChapter,
    getPrevChapterForBook
};