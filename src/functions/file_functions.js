const multer = require("multer");

// const fileFunction = multer({
//   dest: "./src/assets",
//   limits: { fileSize: 100000000 },
//   fileFilter: function (req, file, cb) {
//     if (file.mimetype != "image/png") {
//       return cb(new Error("Wrong file type"), null);
//     }
//     cb(null, true);
//   },
// });
const fileFunction = multer({
  dest : "./src/assets",
  limits: {fileSize: 10000000 },
  fileFilter: function (req, file, cb){
      if(file.mimetype == "image/png" || file.mimetype == "image/jpeg"){
          return cb(null,true);
      }
      cb(new Error("file harus dalam bentuk png/jpg"), null );
  }
});

module.exports = fileFunction;