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

app.put('/book/:id/reviews', auth.requireNotBannedJsonResponse, async (req, res) => {
    await reviewService.updateReview(req, res);
});

module.exports = app;