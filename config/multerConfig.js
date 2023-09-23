// const path = require('path')
// const multer = require('multer');
// var maxSize = 100*1024*1024;
//
//
//     var storage = multer.diskStorage({
//         destination: function(req, file, cb) {
//             cb(null, '../uploads');
//         },
//         filename: function(req, file, cb) {
//             //dat ten file dc uploade len de khong bi trung lap
//             cb(null, file.originalname)
//         },
//     });
//     const Filter = (req, file, cb) => {
//         if (file.mimetype === 'image/jpeg'){ // check file type to be png, jpeg, or jpg
//             cb(null, true);
//         }else{
//             cb(new Error("Ảnh không phải đuổi png nên không upload được"), false);
//         }
//         // const fileSize = parseInt(req.headers["content-length"])
//         // if (fileSize >  maxSize ){
//         //   return cb(new Error("File qua to"), false);
//         // }
//     }
//     var upload = multer({ storage: storage, limits:{fileSize : maxSize}, fileFilter: Filter}).array('hinhAnh',2);
//
// module.exports = upload;
