const express = require("express");
const pemberi = require("../controller/pemberi");
const penerima = require("../controller/penerima");
const apiRouter = express.Router();

const penerimaRouter = express.Router();
penerimaRouter.post("/login", penerima.login);
// kategoriBukuRouter.get("/", kategoriBuku.getAll);
// kategoriBukuRouter.get("/:id", kategoriBuku.getById);
// kategoriBukuRouter.post("/", kategoriBuku.insert);
// kategoriBukuRouter.put("/:id", kategoriBuku.update);
// kategoriBukuRouter.delete("/:id", kategoriBuku.delete);

const pemberiRouter = express.Router();
pemberiRouter.post("/login", pemberi.login);
pemberiRouter.get("/find-receiver", pemberi.mencari_melihat_penerima_donasi);
pemberiRouter.get("/delete-acc", pemberi.delete_acc);
pemberiRouter.get("/update-acc", pemberi.update_acc);
// bukuRouter.get("/:id", buku.getById);
// bukuRouter.post("/", buku.insert);
// bukuRouter.put("/:id", buku.update);
// bukuRouter.delete("/:id", buku.delete);

apiRouter.use("/api/pemberi", pemberiRouter);
apiRouter.use("/api/penerima", penerimaRouter);
module.exports = apiRouter;