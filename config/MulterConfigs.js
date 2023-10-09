const express = require('express');
const multer = require('multer');
const path = require("path");
const maxSize = 100*1024*1024;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'));
    },
    filename: function(req, file, cb) {
        //dat ten file dc uploade len de khong bi trung lap
        const filename = file.originalname.substring(0, file.originalname.indexOf(".")) + "_" +
        new Date(Date.now()).toLocaleString().split(',')[0].replaceAll("/", "-") + '_' + Math.round(Math.random() * 10000) + "." + file.mimetype.replace("image/", "");
        cb(null, filename)
    },
});
const filter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){ // check file type to be png, jpeg, or jpg
        cb(null, true);
    }else{
        cb(new Error("Ảnh không phải đuổi png/jpeg nên không upload được"), false);
    }
    // const fileSize = parseInt(req.headers["content-length"])
    // if (fileSize >  maxSize ){
    //   return cb(new Error("File qua to"), false);
    // }
}
var upload = multer({ storage: storage, limits:{fileSize : maxSize}, fileFilter: filter});

exports.upload = upload;
