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
    }
}

module.exports = transactionFunctions;