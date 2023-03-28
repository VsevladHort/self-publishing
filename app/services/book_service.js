const bookModel = require('../dao/book_dao');
const bookDAO = new bookModel();

const publish = async function (book) {
    const id = await bookDAO.create({
        author: book.author,
        book_title: book.book_title
    });
    return await bookDAO.getById(id);
};

module.exports = {publish}