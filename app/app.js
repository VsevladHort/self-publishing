"use strict";
const dotenv = require('dotenv').config();
const express = require('express');
const userModel = require('./dao/user_dao');
const userService = require('./services/user_service');
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const session = require('express-session');
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
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

const requireNotLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return res.render(path.join(__dirname, 'views/error.ejs'), {
            user: req.session.user,
            problem: 'Only non-logged in users use this page, log out first!'
        })
    }
    next();
}

app.get("/login", requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/login.ejs'), {user: req.session.user, problem: false});
});

app.get("/register", requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/register.ejs'), {user: req.session.user, problem: false});
});

app.get("/logout", requireLogin, async function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

app.post("/register", requireNotLoggedIn, async function (req, res) {
    const {email, username, password} = req.body;
    const findUser = await userDao.getByEmail(email);
    if (findUser !== null) {
        res.render(path.join(__dirname, 'views/register.ejs'), {user: false, problem: 'Email taken!'});
        return;
    }
    const userObj = {
        role: 'user',
        pass_hash: password,
        user_email: email,
        user_name: username
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
        res.render(path.join(__dirname, 'views/login.ejs'), {user: false, problem: 'Email or password incorrect!'});
    }
});

app.get('/profile', requireLogin, (req, res) => {
    res.send('<a href="/logout"> Logout</a>');
});

app.get('/moderator', requireModerator, (req, res) => {
    res.send(`${req.session.user} + <a href="/logout"> Logout</a>`);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));