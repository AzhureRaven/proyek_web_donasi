const db = require("../models");
const axios = require('axios');

const backgroundFunctions = {
    cekDonasi: async() => {
        const transactions = await db.Transaction.findAll({
            where:{
                type: "donation",
                status: "pending"
            }
        })
        for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            const oy = (
                await axios.get(
                    `${process.env.OY_BASE_URL}/api/payment-checkout/status?partner_tx_id=${t.id_transaksi}&send_callback=false`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-oy-username": process.env.OY_USERNAME,
                            "x-api-key": process.env.OY_KEY
                        },
                    }
                )
            ).data;
            if(oy.data.status == "complete"){
                console.log(`${t.id_transaksi} complete`)
                t.status = "complete";
                t.save();
            }
            else if(oy.data.status == "expired"){
                console.log(`${t.id_transaksi} expired`)
                t.status = "expired";
                t.save();
            }
        }
    }
}

module.exports = backgroundFunctions;