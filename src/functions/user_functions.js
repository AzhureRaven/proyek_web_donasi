const db = require("../models");
const { createHash } = require('crypto');

const userFunctions = {
    hash: function(string) {
        return createHash('sha256').update(string).digest('hex');
    },
    getUser: async function(username){
        return await db.User.findByPk(username);
    }
}

module.exports = userFunctions;