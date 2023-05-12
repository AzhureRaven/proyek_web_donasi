const multer = require("multer");

const fileFunction = multer({
  dest: "/src/assets",
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype != "image/png") {
      return cb(new Error("Wrong file type"), null);
    }
    cb(null, true);
  },
});
// const fileFunction = multer({
//   dest : "/src/assets",
//   limits: {fileSize: 1000000 },
//   fileFilter: function (req, file, cb){
//       if(file.mimetype != "image/png" || file.mimetype != "image/jpg"){
//           return cb(new Error("file harus dalam bentuk png/jpg"), null );
//       }
//       cb(null,true);
//   }
// });

module.exports = fileFunction;