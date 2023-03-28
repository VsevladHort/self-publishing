const bookModel = require('../dao/book_dao');
const userModel = require('../dao/user_dao');
const bookDAO = new bookModel();
const userDAO = new userModel();

const publish = async function (book) {
    const id = await bookDAO.create({
        author: book.author,
        book_title: book.book_title
    });
    return await bookDAO.getById(id);
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

module.exports = {publish, getAllForHomePage}