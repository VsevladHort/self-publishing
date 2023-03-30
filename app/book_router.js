const bookService = require("./services/book_service");
const chapterService = require("./services/chapter_service");
const userService = require("./services/user_service");
const path = require("path");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();

app.get('/book/:id', async (req, res) => {
    if (isNaN(req.params.id)) {
        res.status(404).send();
        return;
    }
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    let page = parseInt(req.query.page);
    if (!page || page <= 0)
        page = 1;
    if (book) {
        res.render(path.join(__dirname, 'views/book_view.ejs'), {
            user: req.session.user,
            problem: false,
            book: book,
            reviews: [],
            chapters: await bookService.getChapterList(book.id_book, 1, req.session.user),
            prevPage: page - 1,
            nextPage: page + 1
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.get('/books/my', auth.requireLogin, async (req, res) => {
        let page = parseInt(req.query.page);
        if (!page || page <= 0)
            page = 1;
        const books = await bookService.getAllBooksOfUser(10, page, req.session.user.id_user);
        const booksFirst = await bookService.getAllBooksOfUser(10, 1, req.session.user.id_user);
        const hasBooks = booksFirst.length === 0 ? 'false' : 'true';
        res.render(path.join(__dirname, 'views/user_books.ejs'), {
            user: req.session.user,
            problem: false,
            books: books,
            prevPage: page - 1,
            nextPage: page + 1,
            hasPublishedBooks: hasBooks
        });
    }
);

app.get('/books/my/reading', auth.requireLogin, async (req, res) => {
        const booksFirst = await userService.getReadingListById(req.session.user, 10, 1);
        const hasBooks = booksFirst.length === 0 ? 'false' : 'true';
        res.render(path.join(__dirname, 'views/user_reading_list.ejs'), {
            user: req.session.user,
            problem: false,
            hasReadingList: hasBooks
        });
    }
);

app.delete('/books/my/reading/delete/:id', auth.requireLogin, async (req, res) => {
        if (isNaN(req.params.id)) {
            res.status(404).send();
            return;
        }
        const deleted = await userService.deleteFromReadingList(req.params.id, req.session.user.id_user);
        if (deleted)
            res.status(200).send();
        else
            res.status(500).send();
    }
);

app.post('/books/my/reading/post/:id', auth.requireLogin, async (req, res) => {
        if (isNaN(req.params.id)) {
            res.status(404).send();
            return;
        }
        const inserted = await userService.addToReadingList(req.params.id, req.session.user);
        if (inserted)
            res.status(200).send({msg: "Added to the reading list"});
        else
            res.status(200).send({msg: "Already on the reading list"});
    }
);

app.get('/books/my/reading/back', auth.requireLogin, async (req, res) => {
        let page = parseInt(req.query.page);
        if (!page || page <= 0)
            page = 1;
        const books = await userService.getReadingListById(req.session.user, 10, page);
        const detailedBooks = await bookService.getListById(books);
        res.send(detailedBooks);
    }
);

app.get('/book/:id/chapters', async (req, res) => {
    const page = parseInt(req.query.page);
    const book = parseInt(req.params.id);
    if (isNaN(page) || isNaN(book))
        res.status(400).send();
    const result = await bookService.getChapterList(book, page, req.session.user);
    res.send(JSON.stringify(result));
});

app.get('/book/:id/edit', auth.requireAuthorship, async (req, res) => {
    if (isNaN(req.params.id)) {
        res.status(404).send();
        return;
    }
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (book) {
        res.render(path.join(__dirname, 'views/edit_book.ejs'), {
            user: req.session.user,
            problem: false,
            book: book
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.post('/book/:id/edit', auth.requireAuthorship, async (req, res) => {
    if (isNaN(req.params.id)) {
        res.status(404).send();
        return;
    }
    const hasWorkedEdit = await bookService.edit(parseInt(req.params.id), req.body.title)
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (hasWorkedEdit) {
        res.render(path.join(__dirname, 'views/edit_book.ejs'), {
            user: req.session.user,
            problem: false,
            book: book
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.get('/book/:id/delete', auth.requireAuthorship, async (req, res) => {
    const {sure} = req.query;
    if (sure === 'yes') {
        if (isNaN(req.params.id)) {
            res.status(404).send();
            return;
        }
        const deleted = await bookService.deleteBook(parseInt(req.params.id));
        if (deleted) {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "Your book has been deleted successfully."
            });
        } else {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "There was a problem deleting your book =("
            });
        }
    } else {
        res.render(path.join(__dirname, 'views/delete_confirmation.ejs'), {
            user: req.session.user,
            urlToGoBack: `/book/${req.params.id}/edit`,
            urlToProceed: `/book/${req.params.id}/delete?sure=yes`,
            problem: "Are you sure you want to delete this book?"
        });
    }
});

app.get('/book/:id/publish', auth.requireNotBanned, auth.requireAuthorship, async (req, res) => {
    res.render(path.join(__dirname, 'views/chapter_publish.ejs'), {
        user: req.session.user,
        urlToGoBack: `/book/${req.params.id}`,
        problem: false,
        id_book: req.params.id,
        id_chapter: false,
        chapter: false,
        isAuthor: true
    });
});

app.post('/book/:id/publish', auth.requireNotBanned, auth.requireAuthorship, async (req, res) => {
    const result = await chapterService.createChapter(req.body);
    if (result)
        res.status(200).send({msg: "Your chapter has been published successfully"});
    else
        res.status(500).send({msg: "Error saving document"});
});

app.get('/publish', auth.requireNotBanned, async (req, res) => {
    res.render(path.join(__dirname, 'views/publish.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.post('/publish', auth.requireNotBanned, async (req, res) => {
    const book = await bookService.publish({
        author: req.session.user.id_user,
        book_title: req.body.title
    })
    if (book) {
        res.render(path.join(__dirname, 'views/publish.ejs'), {
            user: req.session.user,
            problem: `Your book by the title ${book.book_title} was successfully published!`
        });
    } else {
        res.render(path.join(__dirname, 'views/publish.ejs'), {
            user: req.session.user,
            problem: "Something went wrong when publishing the book =("
        });
    }
});

module.exports = app;