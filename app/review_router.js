const reviewService = require("./services/review_service");
const auth = require("./auth_middleware");
const express = require("express");
const app = express.Router();
app.get('/book/:id/reviews', async (req, res) => {
    await reviewService.getReviews(req, res);
});

app.post('/book/:id/reviews', auth.requireNotBannedJsonResponse, async (req, res) => {
    await reviewService.createReview(req, res);
});

app.get('/book/:id_book/reviews/:id_user', auth.requireNotBannedJsonResponse,
    auth.requireReviewAuthorshipOrModerationJsonResponse, async (req, res) => {
        await reviewService.getEditReviewPage(req, res);
    });

app.put('/book/:id_book/reviews/:id_user', auth.requireNotBannedJsonResponse,
    auth.requireReviewAuthorshipOrModerationJsonResponse, async (req, res) => {
        await reviewService.updateReview(req, res);
    });

app.delete('/book/:id_book/reviews/:id_user', auth.requireNotBannedJsonResponse,
    auth.requireReviewAuthorshipOrModerationJsonResponse, async (req, res) => {
        await reviewService.deleteReview(req, res);
    });

module.exports = app;