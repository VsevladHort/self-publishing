const userModel = require('../dao/user_dao');
const bcrypt = require('bcrypt');
const userDao = new userModel();

const findAndAuthenticate = async function (email, password) {
    const user = await userDao.getByEmail(email);
    if (user) {
        const isValid = await bcrypt.compare(password, user.pass_hash);
        if (isValid)
            return user;
    }
    return false;
}

const renewInfo = async function (userId) {
    const user = await userDao.getById(userId);
    if (user) {
        return user;
    }
    return false;
}

const editInformation = async function (oldEmail, email, username, password) {
    const user = await userDao.getByEmail(oldEmail);
    const emailCheck = await userDao.getByEmail(email);
    if (user) {
        if (emailCheck && user.user_email !== emailCheck.user_email)
            return false;
        const affectedRows = await userDao.update({
            user_email: email,
            user_name: username,
            pass_hash: password,
            role: user.role,
            banned: user.banned,
            id_user: user.id_user
        });
        if (affectedRows)
            return affectedRows;
    }
    return false;
}

const deleteUser = async function (email) {
    const user = await userDao.getByEmail(email);
    if (user) {
        const deleted = await userDao.deleteById(
            user.id_user
        );
        if (deleted)
            return deleted;
    }
    return false;
}

const banUser = async function (userToBan) {
    const user = await userDao.getByEmail(userToBan.user_email);
    if (user) {
        const updatedId = await userDao.update({
            user_email: user.user_email,
            user_name: user.user_name,
            pass_hash: user.pass_hash,
            role: user.role,
            banned: 1,
            id_user: user.id_user
        });
        if (updatedId)
            return updatedId;
    }
    return false;
}

const unbanUser = async function (userToUnban) {
    const user = await userDao.getByEmail(userToUnban.user_email);
    if (user) {
        const updatedId = await userDao.update({
            user_email: user.user_email,
            user_name: user.user_name,
            pass_hash: user.pass_hash,
            role: user.role,
            banned: 0,
            id_user: user.id_user
        });
        if (updatedId)
            return updatedId;
    }
    return false;
}

const getReadingListById = async function (user, perPage, page) {
    return await userDao.getReadingListById(user.id_user, perPage, page);
}

const getBookmarksListById = async function (user, perPage, page) {
    return await userDao.getBookmarksListById(user.id_user, perPage, page);
}

const deleteFromReadingList = async function (id, user_id) {
    return await userDao.deleteFromReadingList(id, user_id);
}

const deleteFromBookmarksList = async function (id, user_id) {
    return await userDao.deleteFromBookmarksList(id, user_id);
}

const addToReadingList = async function (id, user) {
    const check = await userDao.checkIfExistsInUserReadingList(user.id_user, id)
    if (!check)
        return await userDao.addToReadingList(id, user);
    else
        return false;
}

const addToBookmarksList = async function (id, user) {
    const check = await userDao.checkIfExistsInBookmarksList(user.id_user, id)
    if (!check)
        return await userDao.addToBookmarksList(id, user);
    else
        return false;
}

module.exports = {
    findAndAuthenticate,
    editInformation,
    deleteUser,
    banUser,
    unbanUser,
    renewInfo,
    getReadingListById,
    deleteFromReadingList,
    addToReadingList,
    getBookmarksListById,
    deleteFromBookmarksList,
    addToBookmarksList
}