const auth = require("./auth_middleware");
const path = require("path");
const userService = require("./services/user_service");
const commentService = require("./services/comment_service");
const chapterService = require("./services/chapter_service");
const express = require("express");
const app = express.Router();

app.get('/reports', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return res.render("reports_view.ejs", {
        user: req.session.user
    })
});
app.get('/user/:id', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return userService.getUserDetailsPage(req, res);
});

app.get('/reports/comments', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return commentService.getReportsForComments(req, res);
});

app.get('/reports/chapters', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return chapterService.getReportsForChapters(req, res);
});

app.post('/user/:id/ban', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return userService.processBanUserRequest(req, res);
});

app.delete('/reports/comments/:id_user/:id_comment', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return commentService.deleteReportForComment(req, res);
});

app.delete('/reports/chapters/:id_user/:id_chapter', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return chapterService.deleteReportForChapter(req, res);
});

module.exports = app;