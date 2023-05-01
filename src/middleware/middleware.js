const db = require("../models");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const userFunctions = require("../functions/user_functions");

const middleware = {
    cekToken: async function (req, res, next) {
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
    cekPemberi: async function (req, res, next) {
        if (req.verify.role == "donator") {
            next();    
        }
        else{
            return res.status(403).send({ message: "Jenis akun invalid!" })
        }
    },
    cekPenerima: async function (req, res, next) {
        if (req.verify.role == "receiver") {
            next();
        }
        else{
            return res.status(403).send({ message: "Jenis akun invalid!" })
        }
    }
}

module.exports = middleware;