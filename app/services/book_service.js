const bookModel = require('../dao/book_dao');
const userModel = require('../dao/user_dao');
const bookDAO = new bookModel();
const userDAO = new userModel();
const chapterService = require('../services/chapter_service')
const defaultChapterNum = 10;

const publish = async function (book) {
    const id = await bookDAO.create({
        author: book.author,
        book_title: book.book_title
    });
    return await bookDAO.getById(id);
};

const getChapterList = async function (id_book, page, user) {
    if (user) {
        const book = await bookDAO.getById(id_book);
        if (book.author === user.id_user || user.role === 'moderator') {
            return await chapterService.getChaptersForBook(id_book, defaultChapterNum, page);
        }
    }
    return await chapterService.getChaptersForBookFilteredByPublic(id_book, defaultChapterNum, page);
};

const getAllForHomePage = async function (numPerPage, numOfPage) {
    const books = await bookDAO.getAllOrderedByAvgScoreThenDateWithPagination(numPerPage, numOfPage);
    const booksWithAuthorNames = [];
    for (let book of books) {
        const author = await userDAO.getById(book.author);
        book.author = `${author.user_name}#${author.id_user}`;
        booksWithAuthorNames.push(book);
    }
    return booksWithAuthorNames;
};

const getById = async function (id) {
    return await bookDAO.getById(id);
};

const getByIdForDisplay = async function (id) {
    let book = await bookDAO.getById(id);
    const author = await userDAO.getById(book.author);
    book.author = `${author.user_name}#${author.id_user}`;
    book.authorId = author.id_user;
    return book;
};

const edit = async function (id, title) {
    let book = await bookDAO.getById(id);
    if (book) {
        book.book_title = title;
        return await bookDAO.update(book);
    }
    return book;
};

const deleteBook = async function (id) {
    let book = await bookDAO.getById(id);
    if (book) {
        return await bookDAO.deleteById(id);
    }
    return book;
};

const getAllBooksOfUser = async function (numPerPage, numOfPage, id_user) {
    let user = await userDAO.getById(id_user);
    if (user) {
        return await bookDAO.getAllOrderByDateWithPaginationWhereAuthorIs(numPerPage, numOfPage, id_user);
    }
    return user;
};

const getListById = async function (id) {
    id = id.map(x => x.id_book);
    if (id.length === 0)
        return [];
    return await bookDAO.getListById(id);
}

module.exports = {
    publish,
    getAllForHomePage,
    getById,
    getByIdForDisplay,
    edit,
    deleteBook,
    getChapterList,
    getAllBooksOfUser,
    getListById
}