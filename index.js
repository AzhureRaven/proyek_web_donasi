//npx sequelize-cli init
//npm install --save-dev sequelize-cli
//npx sequelize-cli model:generate --name KategoriBuku --attributes nama:string
//npx sequelize-cli model:generate --name Buku --attributes nama:string

// kalo perlu dokumentasi
// -   https://sequelize.org/docs/v6/other-topics/migrations/
// -   https://sequelize.org/docs/v6/other-topics/query-interface/
// -   https://sequelize.org/docs/v6/core-concepts/model-basics/#data-types
// -   https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface

//bikin migration doang
//npx sequelize-cli migration:generate --name <nama migration>
//bikin model + migration 
//npx sequelize-cli model:generate --name User --attributes <namaattribute>:<datatype>,<namaattribute>:<datatype>

//cmd create model + migration kategori_buku
//npx sequelize-cli model:generate --name KategoriBuku --attributes nama:string
//cmd create model + migration kategori_buku
//npx sequelize-cli model:generate --name KategoriBuku --attributes nama:string
//generate seeder
//npx sequelize-cli seed:generate --name KategoriBuku

//do migrate
//npx sequelize-cli db:migrate
//npx sequelize-cli db:seed:all
const express = require("express");
const apiRouter = require("./src/routes/routes");
const backgroundFunctions = require("./src/background/background");
const app = express();
app.use(express.json());
app.use("/assets", express.static("public"));
app.use(express.urlencoded({ extended: true }))
app.use(apiRouter);

//cara pake dotenv
require('dotenv').config()
//console.log(process.env.OY_USERNAME)

//timer cek donasi sudah dibikin
setInterval(backgroundFunctions.cekDonasi, 900000);

const port = process.env.PORT;
app.listen(port, function () {
  console.log(`listening on port ${port}...`);
});