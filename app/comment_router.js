const commentService = require("./services/comment_service");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();
app.get('/chapter/:id/comments', async (req, res) => {
    await commentService.getComments(req, res);
});

app.post('/chapter/:id/comments', auth.requireNotBannedJsonResponse, async (req, res) => {
    await commentService.createComment(req, res);
});

app.get('/comment/:id', auth.requireNotBannedJsonResponse,
    auth.requireCommentAuthorshipOrModerationJsonResponse, async (req, res) => {
        await commentService.getEditCommentPage(req, res);
    });

app.put('/comment/:id', auth.requireNotBannedJsonResponse,
    auth.requireCommentAuthorshipOrModerationJsonResponse, async (req, res) => {
        await commentService.updateComment(req, res);
    });

app.delete('/comment/:id', auth.requireNotBannedJsonResponse,
    auth.requireCommentAuthorshipOrModerationJsonResponse, async (req, res) => {
        await commentService.deleteComment(req, res);
    });

module.exports = app;