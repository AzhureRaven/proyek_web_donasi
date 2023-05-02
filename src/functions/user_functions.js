const db = require("../models");
const { createHash } = require('crypto');

const userFunctions = {
    hash: (string) => {
        return createHash('sha256').update(string).digest('hex');
    },
    getUser: async (username) => {
        return await db.User.findByPk(username);
    }
}

module.exports = userFunctions;