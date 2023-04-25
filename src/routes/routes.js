const express = require("express");
const transaction = require("../controller/transactions");
const user = require("../controller/users");
const apiRouter = express.Router();

const transactionRouter = express.Router();
// kategoriBukuRouter.get("/", kategoriBuku.getAll);
// kategoriBukuRouter.get("/:id", kategoriBuku.getById);
// kategoriBukuRouter.post("/", kategoriBuku.insert);
// kategoriBukuRouter.put("/:id", kategoriBuku.update);
// kategoriBukuRouter.delete("/:id", kategoriBuku.delete);

const userRouter = express.Router();
userRouter.get("/", user.getAll);
// bukuRouter.get("/:id", buku.getById);
// bukuRouter.post("/", buku.insert);
// bukuRouter.put("/:id", buku.update);
// bukuRouter.delete("/:id", buku.delete);

apiRouter.use("/api/transaction", transactionRouter);
apiRouter.use("/api/user", userRouter);
module.exports = apiRouter;