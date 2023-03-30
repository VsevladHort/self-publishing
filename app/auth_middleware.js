const path = require("path");
const bookService = require('./services/book_service');
const chapterService = require('./services/chapter_service');

const auth = {
    requireLogin: (req, res, next) => {
        if (!req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        }
        next();
    },

    requireModerator: (req, res, next) => {
        if (!req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        } else if (req.session.user.role !== 'moderator') {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'Insufficient authority to view this content!'
            })
        }
        next();
    },

    requireNotBanned: (req, res, next) => {
        if (!req.session.user) {
            return res.status(403).render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        } else if (req.session.user.banned) {
            return res.status(403).render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'You are not allowed to do this content as you are banned!'
            })
        }
        next();
    },

    requireNotLoggedIn: (req, res, next) => {
        if (req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'Only non-logged in users use this page, log out first!'
            })
        }
        next();
    },

    requireAuthorship: async (req, res, next) => {
        if (isNaN(req.params.id)) {
            res.status(400).send();
            return;
        }
        const book = await bookService.getById(parseInt(req.params.id));
        if (!req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        } else if (req.session.user.id_user !== book.author) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'Only author of the book is allowed to do this!'
            })
        }
        next();
    },

    requireChapterOrModerationAuthorship: async (req, res, next) => {
        if (isNaN(req.params.id)) {
            res.status(400).send();
            return;
        }
        const chap = await chapterService.getById(parseInt(req.params.id));
        const book = await bookService.getById(chap.id_book);
        if (!req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        } else if (req.session.user.id_user !== book.author && req.session.user.role !== 'moderator') {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'Only author of the book is allowed to do this!'
            })
        }
        next();
    },

    requireChapterAuthorship: async (req, res, next) => {
        if (isNaN(req.params.id)) {
            res.status(400).send();
            return;
        }
        const chap = await chapterService.getById(parseInt(req.params.id));
        const book = await bookService.getById(chap.id_book);
        if (!req.session.user) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: false,
                problem: 'Only logged in users may view this content!'
            })
        } else if (req.session.user.id_user !== book.author) {
            return res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: 'Only author of the book is allowed to do this!'
            })
        }
        next();
    }
}

module.exports = auth