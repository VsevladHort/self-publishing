const chapterService = require("./services/chapter_service");
const userService = require("./services/user_service");
const path = require("path");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();

app.get('/bookmarks/my', auth.requireLogin, async (req, res) => {
        const booksFirst = await userService.getBookmarksListById(req.session.user, 10, 1);
        const hasBooks = booksFirst.length === 0 ? 'false' : 'true';
        res.render(path.join(__dirname, 'views/user_bookmark_list.ejs'), {
            user: req.session.user,
            problem: false,
            hasReadingList: hasBooks
        });
    }
);

app.delete('/bookmarks/my/delete/:id', auth.requireLogin, async (req, res) => {
        if (isNaN(req.params.id)) {
            res.status(404).send();
            return;
        }
        const deleted = await userService.deleteFromBookmarksList(req.params.id, req.session.user.id_user);
        if (deleted)
            res.status(200).send();
        else
            res.status(500).send();
    }
);

app.post('/bookmarks/my/post/:id', auth.requireLogin, async (req, res) => {
        if (isNaN(req.params.id)) {
            res.status(404).send();
            return;
        }
        const inserted = await userService.addToBookmarksList(req.params.id, req.session.user);
        if (inserted)
            res.status(200).send({msg: "Added to the reading list"});
        else
            res.status(200).send({msg: "Already on the reading list"});
    }
);

app.get('/bookmarks/my/back', auth.requireLogin, async (req, res) => {
        let page = parseInt(req.query.page);
        if (!page || page <= 0)
            page = 1;
        const books = await userService.getBookmarksListById(req.session.user, 10, page);
        const detailedBooks = await chapterService.getChapterListById(books);
        res.send(detailedBooks);
    }
);

module.exports = app;