const bookService = require("../services/book_service");
const chapterService = require("../services/chapter_service");
const userService = require("../services/user_service");
const commentsImport = require("../dao/comment_dao");
const commentDAO = new commentsImport();
const userImport = require("../dao/user_dao");
const userDAO = new userImport();
const path = require("path");
const auth = require("../auth_middleware");

const commentService = {
    async getComments(req, res) {
        const page = parseInt(req.query.page);
        const chapter = parseInt(req.params.id);
        if (isNaN(page) || isNaN(chapter))
            res.status(400).send();
        const chapter_1 = await chapterService.getById(chapter);
        if (!chapter_1) {
            return res.status(404).send(JSON.stringify({msg: "Chapter you are trying to access does not exist!"}));
        }
        let result = await commentDAO.getAllOrderByDateWithPaginationWhereIdChapterIs(10, page, chapter);
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
            if (req.session.user)
                x.editable = parseInt(x.id_user) === parseInt(req.session.user.id_user) || req.session.user.role === 'moderator';
            else
                x.editable = false;
            x.author = `${x.user_name}#${x.id_user}`;
            realResult.push(x);
        }
        res.send(JSON.stringify(realResult));
    },

    async createComment(req, res) {
        const chapter = parseInt(req.params.id);
        if (isNaN(chapter))
            res.status(400).send(JSON.stringify({msg: "Bad parameters"}));
        const chapter_1 = chapterService.getById(chapter);
        if (!chapter_1) {
            return res.status(404).send(JSON.stringify({msg: "Chapter you are trying to access does not exist!"}));
        }
        let comment = {
            text_comment: req.body.text_comment,
            id_chapter: chapter,
            id_user: req.session.user.id_user
        }
        let result = await commentDAO.create(comment);
        if (result)
            res.send(JSON.stringify({msg: "Successfully published comment!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem publishing comment!"}));
    },

    async checkCommentCorrectness(req, res) {
        const comment = parseInt(req.params.id);
        if (isNaN(comment))
            res.status(400).send(JSON.stringify({msg: "Bad parameters"}));
        let check = await commentDAO.getById(comment);
        if (!check) {
            res.send(JSON.stringify({msg: "Comment you are trying to access does not exist!"}));
            return;
        }
        return check;
    },

    async updateComment(req, res) {
        let check = await this.checkCommentCorrectness(req, res);
        if (!check) {
            return;
        }
        check.text_comment = req.body.text_comment;
        check.public = req.body.public;
        let result = await commentDAO.update(check);
        if (result)
            res.send(JSON.stringify({msg: "Successfully updated comment!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem updating comment!"}));
    },

    async deleteComment(req, res) {
        let check = await this.checkCommentCorrectness(req, res);
        if (!check) {
            return;
        }
        let result = await commentDAO.deleteById(check.id_comment);
        if (result)
            res.send(JSON.stringify({msg: "Successfully deleted comment!"}));
        else
            res.send(JSON.stringify({msg: "There was a problem deleting the comment!"}));
    },

    async getEditCommentPage(req, res) {
        let check = await this.checkCommentCorrectness(req, res);
        if (!check)
            return;
        if (req.session.user)
            check.editable = parseInt(check.id_user) === parseInt(req.session.user.id_user) || req.session.user.role === 'moderator';
        else
            check.editable = false;
        check.author = `${check.user_name}#${check.id_user}`;
        res.render('edit_comment_page.ejs', {
            user: req.session.user,
            problem: false,
            comment: check,
            urlToGoBack: `/chapter/${check.id_chapter}`
        });
    },

    async getReportCommentPage(req, res) {
        let check = await this.checkCommentCorrectness(req, res);
        if (!check)
            return;
        check.author = `${check.user_name}#${check.id_user}`;
        res.render('report_comment_page.ejs', {
            user: req.session.user,
            problem: false,
            comment: check,
            urlToGoBack: `/chapter/${check.id_chapter}`
        });
    },

    async reportComment(req, res) {
        let check = await this.checkCommentCorrectness(req, res);
        if (!check)
            return;
        let check1 = await commentDAO.readReport(req.session.user.id_user, check.id_comment)
        if (check1) {
            return res.send(JSON.stringify({msg: "You have already reported this comment!"}));
        }
        const createdReport = commentDAO.createReport(req.session.user.id_user, check.id_comment, req.body.report_content);
        if (createdReport)
            return res.send(JSON.stringify({msg: "Successfully reported comment!"}));
        else
            return res.send(JSON.stringify({msg: "There was a problem reporting comment!"}));
    },

    async getReportsForComments(req, res) {
        const page = parseInt(req.query.page);
        if (isNaN(page))
            return res.status(400).send(JSON.stringify({msg: "Bad page"}));
        let result = await commentDAO.getReportsForComments(10, page);
        return res.send(result);
    },

    async deleteReportForComment(req, res) {
        const id_comment = parseInt(req.params.id_comment);
        const id_user = parseInt(req.params.id_user);
        if (isNaN(id_user) || isNaN(id_comment))
            return res.status(400).send(JSON.stringify({msg: "Bad ids"}));
        let result = await commentDAO.deleteReportByIds(id_user, id_comment);
        if (result) {
            return res.status(200).send(JSON.stringify({msg: "Successfully deleted report"}));
        } else {
            return res.status(500).send(JSON.stringify({msg: "There was a problem deleting report"}));
        }
    }

}

module.exports = commentService;