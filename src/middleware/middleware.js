const db = require("../models");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions");

const middleware = {
    cekToken: async function (req, res, next) { //middleware ini digunakan untuk mengecek authentication dan authorization pengguna. Menerima x-auth-token dan x-auth-username di header. Kalau berhasil, akan diload data pengguna dan ditampung di req.user utk dipakai di endpoint. Middleware ini yang duluan. x-auth-username ada sebagai tambahan layer cek x-auth-token benar isinya
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send({message: "Token tidak ditemukan!"});
        }
        const username = req.header("x-auth-username");
        if (!username) {
            return res.status(401).send({message: "Username tidak ditemukan!"});
        }
        try {
            const verify = jwt.verify(token, process.env.JWT_SECRET); 
            if (verify.username != username) {
                return res.status(403).send({ message: "Token tidak sesuai!" });
            }
            req.verify = verify;
            const user = await userFunctions.getUser(username);
            if(!user){
                return res.status(404).send({ message: "User tidak ditemukan!" });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(400).send({message: "Invalid Token"})
        }  
    },
    cekPemberi: async function (req, res, next) { //middleware ini digunakan untuk ngecek role donator dalam x-auth-token pengguna. middlleware cekToken harus jalan dulu baru yang ini
        if (req.verify.role == "donator") {
            next();    
        }
        else{
            return res.status(403).send({ message: "Jenis akun invalid!" })
        }
    },
    cekPenerima: async function (req, res, next) {//middleware ini digunakan untuk ngecek role receiver dalam x-auth-token pengguna. middlleware cekToken harus jalan dulu baru yang ini
        if (req.verify.role == "receiver") {
            next();
        }
        else{
            return res.status(403).send({ message: "Jenis akun invalid!" })
        }
    },
    cekAksesPemberi: async function (req, res, next) {// untuk mengecek hanya pemberi yang dapat mengakses halaman yang dituju
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send({message: "Token tidak ditemukan!"});
        }

        try{
            const userdata = jwt.verify(token, process.env.JWT_SECRET)

            if(userdata.role == 'donator'){
                req.userdata = userdata
                next();
            }
            else{
                return res.status(403).send({
                    message: 'Jenis akun invalid!'
                })
            }

        } catch (error){
            return res.status(400).send({message: "Invalid Token"})
        }
    },
    cekAksesPenerima: async function (req, res, next) { // untuk mengecek hanya penerima yang dapat mengakses halaman yang dituju
        const token = req.header("x-auth-token");
        if (!token) {
            return res.status(401).send({message: "Token tidak ditemukan!"});
        }

        try{
            const userdata = jwt.verify(token, process.env.JWT_SECRET)

            if(userdata.role == 'receiver'){
                req.userdata = userdata
                next();
            }
            else{
                return res.status(403).send({
                    message: 'Jenis akun invalid!'
                })
            }

        } catch (error){
            return res.status(400).send({message: "Invalid Token"})
        }
    },
}

module.exports = middleware;