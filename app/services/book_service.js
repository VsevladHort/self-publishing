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

const getAllForHomePageWhereTitleIsLike = async function (numPerPage, numOfPage, title) {
    const books = await bookDAO.getAllOrderedByAvgScoreThenDateWithPaginationWhereTitleIsLike(numPerPage, numOfPage, title);
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

const getAllBookTags = async function (id) {
    let book = await bookDAO.getById(id);
    if (book) {
        return await bookDAO.getAllTagsOfBook(id);
    }
    return book;
}

const getAllTags = async function () {
    return await bookDAO.getAllTags();
}

async function checkTagAndBookIdsFromReq(req, res) {
    const id_book = parseInt(req.params.id_book);
    const id_tag = parseInt(req.params.id_tag);
    if (isNaN(id_book) || isNaN(id_tag))
        return 400
    let check1 = await bookDAO.getTag(id_tag);
    let check2 = await bookDAO.getById(id_book);
    if (!check1 || !check2) {
        return 404
    }
    return {id_book: id_book, id_tag: id_tag}
}

async function addTagToBook(req, res) {
    const checkResult = await checkTagAndBookIdsFromReq(req, res);
    if (checkResult === 400) {
        return res.status(400).send(JSON.stringify({msg: "Bad ids"}));
    } else if (checkResult === 404) {
        return res.status(404).send(JSON.stringify({msg: "Tag or book not found!"}))
    }
    const {id_book, id_tag} = checkResult
    let check = await bookDAO.checkIfExistsForBook(id_book, id_tag);
    if (check) {
        return res.status(400).send(JSON.stringify({msg: "Book already has the tag!"}))
    }
    let result = await bookDAO.addTagToBook(id_book, id_tag)
    if (result) {
        return res.status(200).send(JSON.stringify({msg: "Successfully added tag"}));
    } else {
        return res.status(500).send(JSON.stringify({msg: "There was a problem adding tag"}));
    }
}

async function deleteTagFromBook(req, res) {
    const checkResult = await checkTagAndBookIdsFromReq(req, res);
    if (checkResult === 400) {
        return res.status(400).send(JSON.stringify({msg: "Bad ids"}));
    } else if (checkResult === 404) {
        return res.status(404).send(JSON.stringify({msg: "Tag or book not found!"}))
    }
    const {id_book, id_tag} = checkResult
    let check = await bookDAO.checkIfExistsForBook(id_book, id_tag);
    if (!check) {
        return res.status(404).send(JSON.stringify({msg: "Book did not have given tag!"}))
    }
    let result = await bookDAO.removeTagFromBook(id_book, id_tag)
    if (result) {
        return res.status(200).send(JSON.stringify({msg: "Successfully removed tag"}));
    } else {
        return res.status(500).send(JSON.stringify({msg: "There was a problem removing tag"}));
    }
}

async function findBooksByTags(req, res) {
    let page = parseInt(req.query.page);
    let tags = JSON.parse(req.query.tags);
    let title = req.query.title;
    if (typeof tags === "undefined" || tags === null)
        tags = [];
    if (typeof title === "undefined" || title === null)
        title = "";
    if (!page || page <= 0)
        page = 1;
    let result = [];
    if (tags.length === 0)
        result = await bookDAO.getAllOrderedByAvgScoreThenDateWithPaginationWhereTitleIsLike(10, page, title)
    else
        result = await bookDAO.getAllOrderedByAvgScoreThenDateWithPaginationWhereTitleIsLikeAndHasTags(10, page, title, tags)
    res.send(result);
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
    getListById,
    getAllForHomePageWhereTitleIsLike,
    getAllTags,
    getAllBookTags,
    addTagToBook,
    deleteTagFromBook,
    findBooksByTags
}