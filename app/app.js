"use strict";
const express = require('express');
const bookService = require('./services/book_service');
const auth = require('./auth_middleware');
const bookRouter = require('./book_router');
const profileRouter = require('./profile_router');
const authenticationRouter = require('./authentication_router');
const chapterRouter = require('./chapter_router');
const bookmarkRouter = require('./bookmark_router');
const reviewRouter = require('./review_router');
const commentRouter = require('./comment_router');
const moderatorRouter = require('./moderator_router');
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

app.get("/", async function (req, res) {
    let page = parseInt(req.query.page);
    if (!page || page <= 0)
        page = 1;
    let title = req.query.title;
    if (typeof title !== "undefined" && title !== null && title !== "") {
        let books = await bookService.getAllForHomePageWhereTitleIsLike(10, page, title);
        return res.render(path.join(__dirname, 'views/home.ejs'), {
            user: req.session.user,
            problem: false,
            books: books,
            prevPage: page - 1,
            nextPage: page + 1,
            searchTerm: title
        });
    }
    let books = await bookService.getAllForHomePage(10, page);
    res.render(path.join(__dirname, 'views/home.ejs'), {
        user: req.session.user,
        problem: false,
        books: books,
        prevPage: page - 1,
        nextPage: page + 1,
        searchTerm: false
    });
});

app.use(bookRouter);
app.use(chapterRouter);
app.use(profileRouter);
app.use(authenticationRouter);
app.use(bookmarkRouter);
app.use(reviewRouter);
app.use(commentRouter);
app.use(moderatorRouter);

app.get('/moderator', auth.requireModerator, async (req, res) => {
    res.send(`${req.session.user} + <a href="/logout"> Logout</a>`);
});

app.listen(port, () => console.log(`Localhost link: http://localhost:${port}/`));