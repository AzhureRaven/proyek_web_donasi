const db = require("../models");
const Joi = require("joi").extend(require('@joi/date'));
const userFunctions = require("./user_functions");

const joiFunctions = {
    cekPenerima: async (username) => {
        const user = await userFunctions.getUser(username);
        if(!user){
            throw new Error("User tidak ditemukan!");
        }
        if(user.role == "receiver"){
            return true;
        }
        else{
            throw new Error("Jenis akun invalid!")
        }
    }
}

module.exports = joiFunctions;