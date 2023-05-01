const db = require("../models");

const transactionFunctions = {
    getCut: (number, percentage) => {
        const cut = (number * percentage) / 100;
        return cut;
    }
}

module.exports = transactionFunctions;