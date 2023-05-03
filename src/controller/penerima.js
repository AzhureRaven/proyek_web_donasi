const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const axios = require("axios");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions")
const transactionFunctions = require("../functions/transaction_functions")
const joiFunctions = require("../functions/joi_functions")

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
        const user = req.user;
        return res.status(200).send({
            message: "Link Donasi Berhasil Digenerate!",
            display_name: user.display_name,
            desc: user.desc,
            link: `${process.env.BASE_URL}/api/pemberi/beri-donasi/${user.username}`
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
    }
}

module.exports = penerima;