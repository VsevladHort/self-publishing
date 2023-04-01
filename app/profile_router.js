const auth = require("./auth_middleware");
const path = require("path");
const userService = require("./services/user_service");
const express = require("express");
const app = express.Router();

app.get('/profile', auth.requireLogin, async (req, res) => {
    res.render(path.join(__dirname, 'views/profile.ejs'), {
        user: req.session.user,
        problem: false
    });
});

app.get('/profile/delete', auth.requireLogin, async (req, res) => {
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

app.post('/profile', auth.requireLogin, async (req, res) => {
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

app.get('/user/:id', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return userService.getUserDetailsPage(req, res);
});

app.post('/user/:id/ban', auth.requireLogin, auth.requireModerator, async (req, res) => {
    return userService.processBanUserRequest(req, res);
});

module.exports = app;