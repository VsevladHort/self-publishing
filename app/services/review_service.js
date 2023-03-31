const bookService = require("../services/book_service");
const chapterService = require("../services/chapter_service");
const userService = require("../services/user_service");
const reviewsImport = require("../dao/reviews_dao");
const reviewsDAO = new reviewsImport();
const userImport = require("../dao/user_dao");
const userDAO = new userImport();
const path = require("path");
const auth = require("../auth_middleware");

const reviewService = {
    async getReviews(req, res) {
        const page = parseInt(req.query.page);
        const book = parseInt(req.params.id);
        if (isNaN(page) || isNaN(book))
            res.status(400).send();
        let result = await reviewsDAO.getAllOrderByDateWithPagination(10, page, book);
        if (req.session.user)
            result = result.filter(x => {
                return x.public || parseInt(x.id_user) === parseInt(req.session.user.id_user) || req.session.user.role === 'moderator';
            });
        else
            result = result.filter(x => {
                return x.public;
            });
        let realResult = [];
        for (x of result) {
            const author = await userDAO.getById(x.id_user);
            if (req.session.user)
                x.editable = parseInt(x.id_user) === parseInt(req.session.user.id_user) || req.session.user.role === 'moderator';
            else
                x.editable = false;
            x.author = `${author.user_name}#${author.id_user}`;
            realResult.push(x);
        }
        res.send(JSON.stringify(realResult));
    },

    async createReview(req, res) {
        const book = parseInt(req.params.id);
        if (isNaN(book))
            res.status(400).send();
        let check = await reviewsDAO.getById(req.session.user.id_user, book);
        if (check) {
            res.send(JSON.stringify({msg: "You have already published a review!"}));
            return;
        }
        let review = {
            text_review: req.body.text_review,
            id_book: book,
            id_user: req.session.user.id_user
        }
        let result = await reviewsDAO.create(review);
        if (result)
            res.send(JSON.stringify({msg: "Successfully published review!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem publishing review!"}));
    },

    async updateReview(req, res) {
        const book = parseInt(req.params.id_book);
        const user = parseInt(req.params.id_user);
        if (isNaN(book) || isNaN(user))
            res.status(400).send();
        let check = await reviewsDAO.getById(user, book);
        if (!check) {
            res.send(JSON.stringify({msg: "You have not yet published a review to edit!"}));
            return;
        }
        check.text_review = req.body.text_review;
        check.public = req.body.public;
        let result = await reviewsDAO.update(check);
        if (result)
            res.send(JSON.stringify({msg: "Successfully updated review!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem updating review!"}));
    },

    async checkReviewCorrectness(req, res) {
        const book = parseInt(req.params.id_book);
        const user = parseInt(req.params.id_user);
        if (isNaN(book) || isNaN(user))
            res.status(400).send();
        let check = await reviewsDAO.getById(user, book);
        if (!check) {
            res.send(JSON.stringify({msg: "Given user has not yet published a review to delete, or the review has already been deleted!"}));
            return null;
        }
        return check;
    },

    async deleteReview(req, res) {
        let check = await this.checkReviewCorrectness(req, res);
        if (!check)
            return;
        let result = await reviewsDAO.deleteById(check.id_user, check.id_book);
        if (result)
            res.send(JSON.stringify({msg: "Successfully deleted review!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem deleting the review review!"}));
    },

    async getEditReviewPage(req, res) {
        let check = await this.checkReviewCorrectness(req, res);
        if (!check)
            return;
        const author = await userDAO.getById(check.id_user);
        if (req.session.user)
            check.editable = parseInt(check.id_user) === parseInt(req.session.user.id_user) || req.session.user.role === 'moderator';
        else
            check.editable = false;
        check.author = `${author.user_name}#${author.id_user}`;
        res.render('edit_review_page.ejs', {
            user: req.session.user,
            problem: false,
            review: check,
            urlToGoBack: `/book/${check.id_book}`
        });
    }
}

module.exports = reviewService;