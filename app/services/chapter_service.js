const bookModel = require('../dao/book_dao');
const userModel = require('../dao/user_dao');
const chapterModel = require('../dao/chapter_dao');
const bookDAO = new bookModel();
const userDAO = new userModel();
const chapterDAO = new chapterModel();

async function getReportCommentPage(req, res) {
    const id_chapter = parseInt(req.params.id);
    if (isNaN(id_chapter))
        return res.status(400).send(JSON.stringify({msg: "Bad chapter"}));
    const chapter = await chapterDAO.getById(id_chapter);
    if (!chapter)
        return res.status(404).send(JSON.stringify({msg: "No such chapter found"}));
    const book = await bookDAO.getById(chapter.id_book)
    const user = await userDAO.getById(book.author);
    chapter.author = `${user.user_name}#${user.id_user}`;
    res.render('report_chapter_page.ejs', {
        user: req.session.user,
        problem: false,
        chapter: chapter,
        urlToGoBack: `/chapter/${chapter.id_chapter}`
    });
}

async function reportComment(req, res) {
    const id_chapter = parseInt(req.params.id);
    if (isNaN(id_chapter))
        return res.status(400).send(JSON.stringify({msg: "Bad chapter"}));
    const chapter = await chapterDAO.getById(id_chapter);
    if (!chapter)
        return res.status(404).send(JSON.stringify({msg: "No such chapter found"}));
    let check1 = await chapterDAO.readReport(req.session.user.id_user, id_chapter);
    if (check1) {
        return res.send(JSON.stringify({msg: "You have already reported this chapter!"}));
    }
    const createdReport = chapterDAO.createReport(req.session.user.id_user, chapter.id_chapter, req.body.report_content);
    if (createdReport)
        res.send(JSON.stringify({msg: "Successfully reported chapter!"}));
    else
        res.send(JSON.stringify({msg: "There was a problem reporting chapter!"}));
}

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

async function getChaptersForBookFilteredByPublic(id_book, numChapters, page) {
    return await chapterDAO.getChaptersForBookFilteredByPublic(id_book, numChapters, page)
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

const getChapterListById = async function (id) {
    id = id.map(x => x.id_chapter);
    if (id.length === 0)
        return [];
    return await chapterDAO.getListById(id);
}

module.exports = {
    createChapter,
    getById,
    getChaptersForBook,
    getNextChapterForBook,
    edit,
    deleteChapter,
    getPrevChapterForBook,
    getChaptersForBookFilteredByPublic,
    getChapterListById,
    getReportCommentPage,
    reportComment
};