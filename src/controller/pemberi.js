const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions")
const transactionFunctions = require("../functions/transaction_functions")
const joiFunctions = require("../functions/joi_functions")
const dateFunctions = require("../functions/date_functions")

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
    Register: async function (req, res) {
        const schema = Joi.object({
            username: Joi.string().required(),
            password: Joi.string().required(),
            full_name: Joi.string().required(),
            display_name: Joi.string().required(),
            email: Joi.string().email().required(),
            gender: Joi.string().valid('M','F').required(),
            desc: Joi.string().required(),
            hp: Joi.string().required().pattern(/^[0-9]+$/).min(9).max(12),
            tgl_lahir: Joi.date().format('YYYY-MM-DD').required(),
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({ message: error.toString() })
        }
        
        const { username, password,full_name,display_name, email, gender, desc, hp, tgl_lahir } = req.body;
        const user = await db.User.findOne({
            where: {
                [db.Op.or]: [{ username: username }],

            }
        });
        if (user) {
            return res.status(404).send({ message: "Username sudah dipakai" });
        }
        // return res.status(200).send({ message: "unique" });
        const emal = await db.User.findOne({
            where: {
                [db.Op.or]: [{ email: email }],

            }
        });
        if (emal) {
            return res.status(404).send({ message: "email sudah dipakai" });
        }
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
                full_name: full_name,
                display_name: display_name,
                gender:gen,
                desc:desc,
                hp:hp,
                tgl_lahir:tgl_lahir,
                role: "donator"
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
                donator: user.username
            }
        });
        let total = 0;
        let hist = []
        for (let i = 0; i < history.length; i++) {
            let tanggal = history[i].createdAt;
            tanggal = tanggal.toISOString().split('T')[0];
            // let waktu = tanggal.toISOString().split('Z')[0];
            let data ={
                id : history[i].id_transaksi,
                receiver : history[i].receiver,
                amount : history[i].amount,
                status : history[i].status,
                date : tanggal,
                link : history[i].link_transaksi
            }
            if(history[i].status == "complete") total += history[i].amount;
            hist.push(data)
        }
        
        return res.status(200).send({
            total_donasi:total,
            history:hist
        });
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
        const {penerima} = req.params;
        const id = await transactionFunctions.generateDonationId(dateFunctions.todayDate())  
        const oy = (
            await axios.post(
                `${process.env.OY_BASE_URL}/api/payment-checkout/create-v2`,
                {
                    "description": "Donation to "+penerima,
                    "partner_tx_id": id,
                    "notes": "Donation to "+penerima,
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
                    "expiration": dateFunctions.expirationDate(3)
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
        if(oy.status == false){
            return res.status(500).send({
                message: "Maaf! Proses donasi terjadi masalah internal! Mohon dicoba lagi.",
                error: oy.message
            })
        }
        const cut = transactionFunctions.getCut(amount, 10);
        const total = amount - cut;
        await db.Transaction.create({
            id_transaksi: id,
            receiver: penerima,
            donator: req.user.username,
            type: "donation",
            amount: parseInt(amount),
            cut: parseInt(cut),
            total: parseInt(total),
            link_transaksi: oy.url,
            status: "pending"
        })
        return res.status(201).send({
            message: `Link Donasi ke ${req.params.penerima} sukses`,
            id_transaksi: id,
            amount: parseInt(amount),
            link: oy.url,
            status: "pending"
        })
    },
    tesAuth: async function (req, res) {
        return res.status(200).send({
            message: "Authentication Sukses"
        })
    },
    mencari_melihat_penerima_donasi: async function (req, res) {// endpoint ini hanya dapat dikases oleh user dengan role donatur
    // parameter yang diterima dari body : username (username dapat berupa username dan email seperti login)

        const schema = Joi.object({
            username: Joi.string().required()
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({message: error.toString()})
        }
        const {username} = req.body;
        
        const penerima = await db.User.findOne({
            where: {
                [db.Op.or]: [{ username: username }, { email: username }],
                role: "receiver"
            }
        });

        if (!penerima) {
            return res.status(404).send({message: "Tidak ada penerima donasi dengan username "+ username})
        }

        return res.status(200).send({
            username: penerima.username,
            email: penerima.email,
            full_name: penerima.full_name,
            display_name: penerima.display_name,
            gender: penerima.gender,
            description: penerima.desc,
            hp: penerima.hp,
            role: penerima.role,
        })


    },
    delete_acc: async function (req, res) { // endpoint ini digunakan untuk mendelete account, dan hanya user yang login di akun yang ingin dihapus yang dapat menghapus akunnya sendiri

        const userdata = req.userdata;
        const pemberi = await db.User.findOne({
            where: {
                username: userdata.username,
                role: "donator"
            }
        });

        if (!pemberi) {
            return res.status(404).send({message: "Tidak ada akun dengan username "+ userdata.username})
        }

        
        const hapus_pemberi = await db.User.destroy({
            where: {
                username: userdata.username,
                role: "donator"
            }
        });

        return res.status(200).send({
            message: "User dengan username "+userdata.username+" berhasil dihapus"
        })
    },
    update_acc: async function (req, res) { // endpoint ini digunakan untuk mendelete account, dan hanya user yang login di akun yang ingin dihapus yang dapat menghapus akunnya sendiri
        

        const userdata = req.userdata;
        const pemberi = await db.User.findOne({
            where: {
                username: userdata.username,
                role: "donator"
            }
        });

        if (!pemberi) {
            return res.status(404).send({message: "Tidak ada akun dengan username "+ userdata.username})
        }

        const schema = Joi.object({
            full_name: Joi.string().required(),
            display_name: Joi.string().required(),
            gender: Joi.string().valid('Male','Female').required(),
            desc: Joi.string().required(),
            hp: Joi.string().min(9).max(12).pattern(/^[0-9]+$/).required(),
            tgl_lahir: Joi.date().format('DD/MM/YYYY').required(),
        })
        try {
            await schema.validateAsync(req.body)
        } catch (error) {
            return res.status(400).send({message: error.toString()})
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
    }
}

module.exports = pemberi;
