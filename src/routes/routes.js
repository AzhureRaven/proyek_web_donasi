const express = require("express");
// const kategoriBuku = require("../controller/kategoriBuku");
// const buku = require("../controller/buku");
const apiRouter = express.Router();

// const kategoriBukuRouter = express.Router();
// kategoriBukuRouter.get("/", kategoriBuku.getAll);
// kategoriBukuRouter.get("/:id", kategoriBuku.getById);
// kategoriBukuRouter.post("/", kategoriBuku.insert);
// kategoriBukuRouter.put("/:id", kategoriBuku.update);
// kategoriBukuRouter.delete("/:id", kategoriBuku.delete);

// const bukuRouter = express.Router();
// bukuRouter.get("/", buku.getAll);
// bukuRouter.get("/:id", buku.getById);
// bukuRouter.post("/", buku.insert);
// bukuRouter.put("/:id", buku.update);
// bukuRouter.delete("/:id", buku.delete);

// apiRouter.use("/api/kategori", kategoriBukuRouter);
// apiRouter.use("/api/buku", bukuRouter);
module.exports = apiRouter;