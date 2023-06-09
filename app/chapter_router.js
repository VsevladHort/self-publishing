const chapterService = require("./services/chapter_service");
const bookService = require("./services/book_service");
const path = require("path");
const auth = require("./auth_middleware");
const express = require("express");
const commentService = require("./services/comment_service");
const app = express.Router();

app.get('/chapter/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(404).send();
        return;
    }
    const chapter = await chapterService.getById(id);
    const prev = await chapterService.getPrevChapterForBook(chapter.id_book, chapter.datetime_published);
    const next = await chapterService.getNextChapterForBook(chapter.id_book, chapter.datetime_published);
    const book = await bookService.getById(chapter.id_book);
    let isAuthor = req.session.user ? (req.session.user.id_user === book.author
        || req.session.user.role === 'moderator') : false
    if (chapter) {
        chapter.id_user = book.author;
        res.render(path.join(__dirname, 'views/chapter_view.ejs'), {
            user: req.session.user,
            problem: false,
            chapter: chapter,
            prevPage: prev ? prev.id_chapter : false,
            nextPage: next ? next.id_chapter : false,
            isAuthor: isAuthor
        });
    } else
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "The chapter your tried to access does not exist!"
        });
});

app.put('/chapter/:id/edit', auth.requireNotBanned, auth.requireChapterOrModerationAuthorship, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(404).send();
        return;
    }
    const chapter = await chapterService.getById(id);
    const updatedChapter = await chapterService.edit(chapter.id_chapter, req.body);
    if (updatedChapter)
        res.status(200).send({msg: "Chapter successfully updated"});
    else
        res.status(500).send();
});

app.get('/chapter/:id/edit', auth.requireNotBanned, auth.requireChapterOrModerationAuthorship, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        res.status(404).send();
        return;
    }
    const chapter = await chapterService.getById(id);
    const book = await bookService.getById(chapter.id_book);
    let isAuthor = req.session.user ? (req.session.user.id_user === book.author) : false
    res.render(path.join(__dirname, 'views/chapter_publish.ejs'), {
        user: req.session.user,
        urlToGoBack: `/chapter/${req.params.id}`,
        problem: false,
        isAuthor: isAuthor,
        id_book: book.id_book,
        chapter: chapter
    });
});

app.get('/chapter/:id/delete', auth.requireChapterOrModerationAuthorship, async (req, res) => {
    const {sure} = req.query;
    if (sure === 'yes') {
        if (isNaN(req.params.id)) {
            res.status(400).send();
            return;
        }
        const deleted = await chapterService.deleteChapter(parseInt(req.params.id));
        if (deleted) {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "This chapter has been deleted successfully."
            });
        } else {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "There was a problem deleting this chapter =("
            });
        }
    } else {
        res.render(path.join(__dirname, 'views/delete_confirmation.ejs'), {
            user: req.session.user,
            urlToGoBack: `/chapter/${req.params.id}/edit`,
            urlToProceed: `/chapter/${req.params.id}/delete?sure=yes`,
            problem: "Are you sure you want to delete this chapter?"
        });
    }
});

app.get('/chapter/:id/report', auth.requireNotBannedJsonResponse, async (req, res) => {
    await chapterService.getReportCommentPage(req, res);
});

app.post('/chapter/:id/report', auth.requireNotBannedJsonResponse, async (req, res) => {
    await chapterService.reportComment(req, res);
});

module.exports = app;