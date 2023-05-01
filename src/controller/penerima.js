const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions")

const penerima = {
    login: async function (req, res) {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({message: error.toString()})
        }
        const {username, password} = req.body;
        const user = await db.User.findOne({
            where: {
                [db.Op.or]: [{ username: username }, { email: username }],
                password: userFunctions.hash(password)
            }
        });
        if (!user) {
            return res.status(404).send({message: "Username/Email atau Password Invalid!"})
        }
        if(user.role != "receiver"){
            return res.status(403).send({message: "Jenis Akun Invalid!"})
        }
        let token = jwt.sign({
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET, {})
        return res.status(200).send({
            message: "Welcome Back, "+user.display_name,
            token: token
        })
    },
    getLink: async function (req, res) {
        return res.status(200).send({
            message: "Welcome Back, "
        }) 
    }
}

module.exports = penerima;