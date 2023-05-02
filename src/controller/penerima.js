const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions")
const transactionFunctions = require("../functions/transaction_functions")
const joiFunctions = require("../functions/joi_functions")
const dateFunctions = require("../functions/date_functions")

const penerima = {
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
            return res.status(404).send({ message: "Username/Email atau Password Invalid!" })
        }
        if (user.role != "receiver") {
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
    getLink: async function (req, res) {
        const user = req.user;
        return res.status(200).send({
            message: "Link Donasi Berhasil Digenerate!",
            display_name: user.display_name,
            desc: user.desc,
            link: `${process.env.BASE_URL}/api/pemberi/beri-donasi/${user.username}`
        })
    },
    transfer: async function (req, res) {
        const schema = Joi.object({
            amount: Joi.number().min(100000).required(),
            bank_code: Joi.string().required(),
            bank_account: Joi.string().required(),
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({ message: error.toString() })
        }
        const { amount, bank_code, bank_account } = req.body;
        const saldo = await transactionFunctions.calculateSaldo(req.user.username)
        if(saldo < amount){
            return res.status(400).send({ 
                message: "Saldo tidak mencukupi!",
                saldo_sekarang: parseInt(saldo),
                amount_entered: parseInt(amount) 
            })
        }
        const id = await transactionFunctions.generateTransferId(dateFunctions.todayDate())
        const cut = transactionFunctions.getCut(amount, 5);
        const total = amount - cut;
        const oy = (
            await axios.post(
                `${process.env.OY_BASE_URL}/api/remit`,
                {
                    "recipient_bank": bank_code+"",
                    "recipient_account": bank_account+"",
                    "amount": total,
                    "note": "Transfer from "+req.user.username,
                    "partner_trx_id": id,
                    "email": req.user.email
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
        if (oy.status.code != "101") {
            return res.status(400).send({
                message: oy.status.message,
                error_code: oy.status.code
            })
        }
        
        await db.Transaction.create({
            id_transaksi: id,
            receiver: req.user.username,
            type: "transfer",
            amount: parseInt(amount),
            cut: parseInt(cut),
            total: parseInt(total),
            bank_code: bank_code+"",
            bank_account: bank_account+"",
            status: "complete"
        })
        return res.status(201).send({
            message: `Transfer dari akun ${req.user.username} sukses`,
            id_transaksi: id,
            amount: parseInt(amount),
            biaya_admin: parseInt(cut),
            total_akhir: parseInt(total),
            sisa_saldo: parseInt(saldo) - parseInt(amount),
            bank_code: bank_code+"",
            bank_account: bank_account+""
        })
    },
    tesAuth: async function (req, res) {
        return res.status(200).send({
            message: "Authentication Sukses"
        })
    }
}

module.exports = penerima;