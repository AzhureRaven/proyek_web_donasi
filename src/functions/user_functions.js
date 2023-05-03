const db = require("../models");
const { createHash } = require('crypto');

const userFunctions = {
    hash: (string) => { //fungsi untuk buat hash dari password
        return createHash('sha256').update(string).digest('hex');
    },
    getUser: async (username) => { //fungsi untuk mencari user dari username
        return await db.User.findByPk(username);
    }
}

module.exports = userFunctions;