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
    Register: async function (req, res) {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
            fullname: Joi.string().required(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            gender: Joi.string().valid('M','F').required(),
            description: Joi.string().required(),
            phone_number: Joi.string().required().pattern(/^[0-9]+$/).min(9).max(12),
            tanggal_lahir: Joi.date().format('YYYY-MM-DD').required(),
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({ message: error.toString() })
        }
        
        const { username, password,fullname,name, email, gender, description, phone_number, tanggal_lahir } = req.body;
        const user = await db.User.findOne({
            where: {
                [db.Op.or]: [{ username: username }],

            }
        });
        if (user) {
            return res.status(404).send({ message: "Username sudah dipakai" });
        }
        // return res.status(200).send({ message: "unique" });
        let gen= ""
        if (gender =='M'){
            gen = "Male"
        }
        else{
            gen = "Female"
        }

        const newUser = await db.User.create({
             username: username,
             email: email,
                password: userFunctions.hash(password),
                full_name: fullname,
                display_name: name,
                gender:gen,
                desc:description,
                hp:phone_number,
                tgl_lahir:tanggal_lahir,
                role: "receiver"
        });
        return res.status(201).send({ message: "User berhasil dibuat!"});
    },
    Profile: async function (req,res ){
        const userdata = req.user;
        let tanggal_lahir = userdata.tgl_lahir ;
        tanggal_lahir = tanggal_lahir.toISOString().split('T')[0];
        let profile ={
            username: userdata.username,
            email: userdata.email,
            full_name: userdata.full_name,
            display_name: userdata.display_name,
            gender: userdata.gender,
            description: userdata.desc,
            phone_number: userdata.hp,
            tanggal_lahir: tanggal_lahir,
            role: userdata.role
        }
        return res.status(200).send({
            profile:profile
        });
    },
    History: async function (req,res){
        const user = req.user;
        const history = await db.Transaction.findAll({
            where: {
                receiver: user.username,
            }
        })
        let total_d = 0;
        let total_t = 0;
        const saldo = await transactionFunctions.calculateSaldo(req.user.username)
        let hist = []
        for (let i = 0; i < history.length; i++) {
            let tanggal = history[i].createdAt;
            tanggal = tanggal.toISOString().split('T')[0];
            // let waktu = tanggal.toISOString().split('Z')[0];
            let data ={
                id_transaksi : history[i].id_transaksi,
                donator : history[i].donator,
                amount : history[i].amount,
                cut : history[i].cut,
                total : history[i].total,
                type : history[i].type,
                date : tanggal,
            }
            if (history[i].type == "donation"){
                total_d += history[i].total
            }
            else{
                total_t += history[i].total
            }

            hist.push(data)
        }
        
        return res.status(200).send({
            total_donasi_yang_diterima : total_d,
            total_transfer : total_t,
            saldo : saldo,
            history:hist
        });
    },
    HistoryD: async function (req,res){
        const user = req.user;
        const history = await db.Transaction.findAll({
            where: {
                receiver: user.username,
                type : "donation"
            }
        })
        let total = 0;
        const saldo = await transactionFunctions.calculateSaldo(req.user.username)
        let hist = []
        for (let i = 0; i < history.length; i++) {
            let tanggal = history[i].createdAt;
            tanggal = tanggal.toISOString().split('T')[0];
            // let waktu = tanggal.toISOString().split('Z')[0];
            let data ={
                id_transaksi : history[i].id_transaksi,
                donator : history[i].donator,
                amount : history[i].amount,
                cut : history[i].cut,
                total : history[i].total,
                date : tanggal,
            }
            total += history[i].total
            hist.push(data)
        }
        
        return res.status(200).send({
            total_donasi_yang_diterima : total,
            saldo : saldo,
            history:hist
        });
    },
    HistoryT: async function (req,res){
        const user = req.user;
        const history = await db.Transaction.findAll({
            where: {
                receiver: user.username,
                type : "transfer"
            }
        })
        let total = 0;
        const saldo = await transactionFunctions.calculateSaldo(req.user.username)
        let hist = []
        for (let i = 0; i < history.length; i++) {
            let tanggal = history[i].createdAt;
            tanggal = tanggal.toISOString().split('T')[0];
            // let waktu = tanggal.toISOString().split('Z')[0];
            let data ={
                id_transaksi : history[i].id_transaksi,
                donator : history[i].donator,
                amount : history[i].amount,
                cut : history[i].cut,
                total : history[i].total,
                date : tanggal,
            }
            total += history[i].total
            hist.push(data)
        }
        
        return res.status(200).send({
            total_transfer : total,
            saldo : saldo ,
            history:hist
        });
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
    },
    delete_acc: async function (req, res) { // endpoint ini digunakan untuk mendelete account, dan hanya user yang login di akun yang ingin dihapus yang dapat menghapus akunnya sendiri

        const userdata = req.userdata;
        const penerima = await db.User.findOne({
            where: {
                username: userdata.username,
                role: "receiver"
            }
        });

        if (!penerima) {
            return res.status(404).send({message: "Tidak ada akun dengan username "+ userdata.username})
        }

        
        const hapus_penerima = await db.User.destroy({
            where: {
                username: userdata.username,
                role: "receiver"
            }
        });

        return res.status(200).send({
            message: "User dengan username "+userdata.username+" berhasil dihapus"
        })
    },
    update_acc: async function (req, res) { // endpoint ini digunakan untuk mendelete account, dan hanya user yang login di akun yang ingin dihapus yang dapat menghapus akunnya sendiri
        

        const userdata = req.userdata;
        const penerima = await db.User.findOne({
            where: {
                username: userdata.username,
                role: "receiver"
            }
        });

        if (!penerima) {
            return res.status(404).send({message: "Tidak ada akun dengan username "+ userdata.username})
        }

        const {full_name, display_name, gender, desc, hp, tgl_lahir} = req.body;

        const [day,month,year] = tgl_lahir.split('/');//format dd/mm/yyyy
        
        const date = new Date(+year, +month - 1, +day);

        const update_data = await db.User.update(
            {
                full_name: full_name,
                display_name:display_name,
                gender:gender,
                desc:desc,
                hp:hp,
                tgl_lahir:date,
            },
            {
                where:{
                    username:userdata.username
                }
            }
        );

        const body = {
            full_name: full_name,
            display_name:display_name,
            gender:gender,
            desc:desc,
            hp:hp,
            tgl_lahir:tgl_lahir,
        }
        

        return res.status(200).send({
            message: "User dengan username "+userdata.username+" berhasil diupdate",
            body
        })
    },
}

module.exports = penerima;