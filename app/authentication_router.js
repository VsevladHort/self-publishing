const auth = require("./auth_middleware");
const path = require("path");
const userService = require("./services/user_service");
const express = require("express");
const userModel = require("./dao/user_dao");
const app = express.Router();
const userDao = new userModel();
app.get("/login", auth.requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/login.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/register", auth.requireNotLoggedIn, async function (req, res) {
    res.render(path.join(__dirname, 'views/register.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get("/logout", auth.requireLogin, async function (req, res) {
    req.session.user = null;
    res.redirect('/login');
});

app.post("/register", auth.requireNotLoggedIn, async function (req, res) {
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

app.post("/login", auth.requireNotLoggedIn, async function (req, res) {
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

module.exports = app;