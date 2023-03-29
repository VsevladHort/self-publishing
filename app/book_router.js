const bookService = require("./services/book_service");
const path = require("path");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();

app.get('/book/:id', async (req, res) => {
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (book) {
        res.render(path.join(__dirname, 'views/book_view.ejs'), {
            user: req.session.user,
            problem: false,
            book: book,
            reviews: [],
            chapters: []
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
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
        problem: false
    });
});

module.exports = app;