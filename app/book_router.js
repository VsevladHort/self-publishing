const bookService = require("./services/book_service");
const chapterService = require("./services/chapter_service");
const path = require("path");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();

app.get('/book/:id', async (req, res) => {
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
            chapters: await bookService.getChapterList(book.id_book, 1),
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

app.get('/book/:id/chapters', async (req, res) => {
    const page = parseInt(req.query.page);
    const book = parseInt(req.params.id);
    const result = await bookService.getChapterList(book, page);
    res.send(JSON.stringify(result));
});

app.get('/book/:id/edit', auth.requireAuthorship, async (req, res) => {
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
        chapter: false
    });
});

app.post('/book/:id/publish', auth.requireNotBanned, auth.requireAuthorship, async (req, res) => {
    const result = await chapterService.createChapter(req.body);
    if (result)
        res.status(200).send({msg: "Your chapter has been published successfully"});
    else
        res.status(500).send({msg: "Error saving document"});
});

module.exports = app;