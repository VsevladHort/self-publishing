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

module.exports = {findAndAuthenticate}