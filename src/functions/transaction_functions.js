const db = require("../models");

const transactionFunctions = {
    getCut: (number, percentage) => {
        const cut = (number * percentage) / 100;
        return cut;
    },
    generateDonationId: async (date) => {
        const count = await db.Transaction.count({
            where: {
                type: "donation",
                createdAt: {
                    [db.Op.gte]: new Date(date.slice(0, 10))
                }
            }
        });
        const id = `DNT${date.slice(0, 10).replace(/-/g, "")}${(count + 1).toString().padStart(3, '0')}`;
        return id;
    },
    generateTransferId: async (date) => {
        const count = await db.Transaction.count({
            where: {
                type: "transfer",
                createdAt: {
                    [db.Op.gte]: new Date(date)
                }
            }
        });
        const id = `TRF${date.slice(0, 10).replace(/-/g, "")}${(count + 1).toString().padStart(3, '0')}`;
        return id;
    },
    calculateSaldo: async (username) =>{
        const donations = await db.Transaction.sum('total', {
            where:{
                receiver: username,
                type: "donation"
            }
        })
        const transfers = await db.Transaction.sum("amount", {
            where:{
                receiver: username,
                type: "transfer"
            }
        })
        const saldo = donations - transfers;
        return saldo;
    }
}

module.exports = transactionFunctions;