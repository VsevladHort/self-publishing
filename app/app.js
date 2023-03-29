"use strict";
const dotenv = require('dotenv').config();
const express = require('express');
const userModel = require('./dao/user_dao');
const userService = require('./services/user_service');
const bookService = require('./services/book_service');
const chapterService = require("./services/chapter_service");
const auth = require('./auth_middleware');
const bookRouter = require('./book_router');
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const session = require('express-session');
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET, resave: true, saveUninitialized: true
}));
app.set('view engine', 'ejs');

const userDao = new userModel();

app.get("/", async function (req, res) {
    let page = parseInt(req.query.page);
    if (!page || page <= 0)
        page = 1;
    let books = await bookService.getAllForHomePage(10, page);
    res.render(path.join(__dirname, 'views/home.ejs'), {
        user: req.session.user,
        problem: false,
        books: books,
        prevPage: page - 1,
        nextPage: page + 1
    });
});

app.get("/login", auth.requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/login.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/register", auth.requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/register.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/logout", auth.requireLogin, async function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

app.post("/register", auth.requireNotLoggedIn, async function (req, res) {
    const {email, username, password} = req.body;
    const findUser = await userDao.getByEmail(email);
    if (findUser !== null) {
        res.render(path.join(__dirname, 'views/register.ejs'), {
            user: false,
            problem: 'Email taken!'
        });
        return;
    }
    const userObj = {
        role: 'user', pass_hash: password, user_email: email, user_name: username
    }
    userDao.create(userObj).then(() => res.redirect("/login"))
});

app.post("/login", auth.requireNotLoggedIn, async function (req, res) {
    const {email, password} = req.body;
    const user = await userService.findAndAuthenticate(email, password);
    if (user) {
        req.session.user = user;
        res.redirect('/profile');
    } else {
        res.render(path.join(__dirname, 'views/login.ejs'), {
            user: false,
            problem: 'Email or password incorrect!'
        });
    }
});

app.get('/profile', auth.requireLogin, async (req, res) => {
    res.render(path.join(__dirname, 'views/profile.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get('/profile/delete', auth.requireLogin, async (req, res) => {
    const {sure} = req.query;
    if (sure === 'yes') {
        const deleted = await userService.deleteUser(req.session.user.user_email);
        if (deleted) {
            req.session.user = null;
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: "Your account has been deleted successfully."
            });
        } else {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "There was a problem deleting your account =("
            });
        }
    } else {
        res.render(path.join(__dirname, 'views/delete_confirmation.ejs'), {
            user: req.session.user,
            urlToGoBack: "/profile",
            urlToProceed: "/profile/delete?sure=yes",
            problem: "Are you sure you want to delete your account?"
        });
    }
});

app.post('/profile', auth.requireLogin, async (req, res) => {
    const {email, username, password} = req.body;
    const success = await userService.editInformation(req.session.user.user_email, email, username, password);
    if (success) {
        req.session.user = await userService.renewInfo(req.session.user.id_user);
        res.render(path.join(__dirname, 'views/profile.ejs'), {
            user: req.session.user,
            problem: "Your info has been updated successfully!"
        });
    } else {
        res.render(path.join(__dirname, 'views/profile.ejs'), {
            user: req.session.user,
            problem: "There was a problem updating your info, your new email may not be unused!"
        });
    }
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

app.get('/chapter/:id', async (req, res) => {
    const chapter = await chapterService.getById(parseInt(req.params.id));
    const prev = await chapterService.getPrevChapterForBook(chapter.id_book, chapter.datetime_published);
    const next = await chapterService.getNextChapterForBook(chapter.id_book, chapter.datetime_published);
    if (chapter)
        res.render(path.join(__dirname, 'views/chapter_view.ejs'), {
            user: req.session.user,
            problem: false,
            chapter: chapter,
            prevPage: prev ? prev.id_chapter : false,
            nextPage: next ? next.id_chapter : false
        });
    else
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "The chapter your tried to access does not exist!"
        });
});

app.use(bookRouter);

app.get('/moderator', auth.requireModerator, async (req, res) => {
    res.send(`${req.session.user} + <a href="/logout"> Logout</a>`);
});

app.listen(port, () => console.log(`Localhost link: http://localhost:${port}/`));