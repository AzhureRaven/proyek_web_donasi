const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions")
const transactionFunctions = require("../functions/transaction_functions")
const joiFunctions = require("../functions/joi_functions")

const pemberi = {
    login: async function (req, res) {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required()
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({ message: error.toString() })
        }
        const { username, password } = req.body;
        const user = await db.User.findOne({
            where: {
                [db.Op.or]: [{ username: username }, { email: username }],
                password: userFunctions.hash(password)
            }
        });
        if (!user) {
            return res.status(404).send({ message: "Username/Email or Password Invalid!" })
        }
        if (user.role != "donator") {
            return res.status(403).send({ message: "Jenis Akun Invalid!" })
        }
        let token = jwt.sign({
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET, {})
        return res.status(200).send({
            message: "Welcome Back, " + user.display_name,
            token: token
        })
    },
    beriDonasi: async function (req, res) {
        const schemaBody = Joi.object({
            amount: Joi.number().min(10000).required(),
        })
        const schemaParams = Joi.object({
            penerima: Joi.string().required().external(joiFunctions.cekPenerima),
        })
        try {
            await schemaBody.validateAsync(req.body)
            await schemaParams.validateAsync(req.params)
        } catch (error) {
            return res.status(400).send({ message: error.toString() })
        }
        const {amount} = req.body;
        const {penerima} = req.body;
        const result = (
            await axios.post(
                `${process.env.OY_BASE_URL}/api/payment-checkout/create-v2`,
                {
                    "description": "Donation to "+penerima,
                    "partner_tx_id": "",
                    "sender_name": req.user.username,
                    "amount": amount,
                    "email": req.user.email,
                    "phone_number": req.user.hp+"",
                    "is_open": false,
                    "step": "input-amount",
                    "include_admin_fee": true,
                    "list_disabled_payment_methods": "",
                    "list_enabled_banks": "002, 008, 009, 013, 022",
                    "list_enabled_ewallet": "shopeepay_ewallet",
                    "expiration": "2023-06-14 13:00:00"
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-oy-username": process.env.OY_USERNAME,
                        "x-api-key": process.env.OY_KEY
                    },
                }
            )
        ).data;

        return res.status(200).send({
            message: "Donasi Link " + req.params.penerima
        })
    },
    tesAuth: async function (req, res) {
        return res.status(200).send({
            message: "Authentication Sukses"
        })
    }
}

module.exports = pemberi;