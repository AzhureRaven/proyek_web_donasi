const express = require("express");
const pemberi = require("../controller/pemberi");
const penerima = require("../controller/penerima");
const apiRouter = express.Router();
const middleware = require("../middleware/middleware");

const penerimaRouter = express.Router();
penerimaRouter.post("/login", penerima.login);
penerimaRouter.get("/link-donasi", [middleware.cekToken, middleware.cekPenerima], penerima.getLink);
penerimaRouter.post("/transfer", [middleware.cekToken, middleware.cekPenerima], penerima.transfer);
// kategoriBukuRouter.get("/", kategoriBuku.getAll);
// kategoriBukuRouter.get("/:id", kategoriBuku.getById);
// kategoriBukuRouter.post("/", kategoriBuku.insert);
// kategoriBukuRouter.put("/:id", kategoriBuku.update);
// kategoriBukuRouter.delete("/:id", kategoriBuku.delete);

penerimaRouter.get("/tes-auth",[middleware.cekToken, middleware.cekPenerima], penerima.tesAuth) //buat tes middleware

const pemberiRouter = express.Router();
pemberiRouter.post("/login", pemberi.login);
pemberiRouter.post("/beri-donasi/:penerima", [middleware.cekToken, middleware.cekPemberi], pemberi.beriDonasi);
pemberiRouter.get("/find-receiver", pemberi.mencari_melihat_penerima_donasi);
pemberiRouter.get("/delete-acc", pemberi.delete_acc);
pemberiRouter.get("/update-acc", pemberi.update_acc);
// bukuRouter.get("/:id", buku.getById);
// bukuRouter.post("/", buku.insert);
// bukuRouter.put("/:id", buku.update);
// bukuRouter.delete("/:id", buku.delete);

pemberiRouter.get("/tes-auth",[middleware.cekToken, middleware.cekPemberi], pemberi.tesAuth)

apiRouter.use("/api/penerima", penerimaRouter);
apiRouter.use("/api/pemberi", pemberiRouter);
module.exports = apiRouter;