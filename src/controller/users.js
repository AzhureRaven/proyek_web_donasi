const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");

const user = {
    getAll: async function (req, res) {
        const buku = await db.User.findAll();
        return res.status(200).send(buku)
    },
}

module.exports = user;