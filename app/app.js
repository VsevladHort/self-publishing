"use strict";
const dotenv = require('dotenv').config();
const express = require('express');
const userModel = require('./dao/user_dao');
const userService = require('./services/user_service');
const bookService = require('./services/book_service');
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

const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.render(path.join(__dirname, 'views/error.ejs'), {
            user: false,
            problem: 'Only logged in users may view this content!'
        })
    }
    next();
}

const requireModerator = (req, res, next) => {
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
}

const requireNotBanned = (req, res, next) => {
    if (!req.session.user) {
        return res.render(path.join(__dirname, 'views/error.ejs'), {
            user: false,
            problem: 'Only logged in users may view this content!'
        })
    } else if (req.session.user.banned) {
        return res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: 'You are not allowed to do this content as you are banned!'
        })
    }
    next();
}

const requireNotLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: 'Only non-logged in users use this page, log out first!'
        })
    }
    next();
}

const requireAuthorship = async (req, res, next) => {
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
}

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

app.get("/login", requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/login.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/register", requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/register.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/logout", requireLogin, async function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

app.post("/register", requireNotLoggedIn, async function (req, res) {
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

app.post("/login", requireNotLoggedIn, async function (req, res) {
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

app.get('/profile', requireLogin, async (req, res) => {
    res.render(path.join(__dirname, 'views/profile.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get('/profile/delete', requireLogin, async (req, res) => {
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

app.post('/profile', requireLogin, async (req, res) => {
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

app.get('/publish', requireNotBanned, async (req, res) => {
    res.render(path.join(__dirname, 'views/publish.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.post('/publish', requireNotBanned, async (req, res) => {
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

app.get('/book/:id', async (req, res) => {
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (book) {
        res.render(path.join(__dirname, 'views/book_view.ejs'), {
            user: req.session.user,
            problem: false,
            book: book,
            reviews: [],
            chapters: []
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.get('/book/:id/edit', requireAuthorship, async (req, res) => {
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (book) {
        res.render(path.join(__dirname, 'views/edit_book.ejs'), {
            user: req.session.user,
            problem: false,
            book: book
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.post('/book/:id/edit', requireAuthorship, async (req, res) => {
    const hasWorkedEdit = await bookService.edit(parseInt(req.params.id), req.body.title)
    const book = await bookService.getByIdForDisplay(parseInt(req.params.id))
    if (hasWorkedEdit) {
        res.render(path.join(__dirname, 'views/edit_book.ejs'), {
            user: req.session.user,
            problem: false,
            book: book
        });
    } else {
        res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: "Something went wrong, the book may not exist =("
        });
    }
});

app.get('/book/:id/delete', requireAuthorship, async (req, res) => {
    const {sure} = req.query;
    if (sure === 'yes') {
        const deleted = await bookService.deleteBook(parseInt(req.params.id));
        if (deleted) {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "Your book has been deleted successfully."
            });
        } else {
            res.render(path.join(__dirname, 'views/error.ejs'), {
                user: req.session.user,
                problem: "There was a problem deleting your book =("
            });
        }
    } else {
        res.render(path.join(__dirname, 'views/delete_confirmation.ejs'), {
            user: req.session.user,
            urlToGoBack: `/book/${req.params.id}/edit`,
            urlToProceed: `/book/${req.params.id}/delete?sure=yes`,
            problem: "Are you sure you want to delete this book?"
        });
    }
});

app.get('/moderator', requireModerator, async (req, res) => {
    res.send(`${req.session.user} + <a href="/logout"> Logout</a>`);
});

app.listen(port, () => console.log(`Localhost link: http://localhost:${port}/`));