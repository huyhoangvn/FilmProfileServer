var express = require('express');
var router = express.Router();
const {} = require("express");
var mongo = require('mongoose');
const {log} = require("debug");
const {route} = require("express/lib/router");
const multer = require('multer');
var maxSize = 100*1024*1024;
main().catch(err => console.log(err));

//Luu hinh anh
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads');
    },
    filename: function(req, file, cb) {
        //dat ten file dc uploade len de khong bi trung lap
        cb(null, file.originalname)
    },
});
const Filter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg'){ // check file type to be png, jpeg, or jpg
        cb(null, true);
    }else{
        cb(new Error("Ảnh không phải đuổi png nên không upload được"), false);
    }
    // const fileSize = parseInt(req.headers["content-length"])
    // if (fileSize >  maxSize ){
    //   return cb(new Error("File qua to"), false);
    // }
}
var upload = multer({ storage: storage, limits:{fileSize : maxSize}, fileFilter: Filter});

/* GET home page. */
//Ket noi mongoose
async function main(){
    await mongo.connect('mongodb+srv://phucnxph29170:Kondien123@cluster0.kutdlfc.mongodb.net/film')
}
//Khoi tao account
const account = new mongo.Schema({
    ten: String,
    gmail: String,
    matKhau: String,
    nhapLai:String,
    gioiTinh:String,
    moTa:String,
    hinhAnh: [{type:String}]
});

//Them account
router.post('/api/themTaiKhoan', upload.array('hinhAnh',2), async function (req, res, next) {
    const ten = req.body.ten
    const gmail = req.body.gmail
    const matKhau = req.body.matKhau
    const nhapLai = req.body.nhapLai
    const gioiTinh = req.body.gioiTinh
    const moTa = req.body.moTa
    const hinhAnh = req.files.map(file => file.filename);
    console.log( req)
    var objId ;
    const ACCOUNT = mongo.model('TaiKhoan', account, 'profile')

    await ACCOUNT.create({
        ten:ten,
        gmail:gmail,
        matKhau:matKhau,
        nhapLai:nhapLai,
        gioiTinh:gioiTinh,
        moTa:moTa,
        hinhAnh: hinhAnh
    }).then(result => {objId = result._id})
    const data = await ACCOUNT.find({_id: objId});

        res.end(JSON.stringify({ten:data[0].ten}));
},
    async function (err,req, res,next ) {
        console.log(err)
        const ACCOUNT = mongo.model('TaiKhoan', account, 'profile')
        const data = await ACCOUNT.find();
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.render('index', { message: 'Vượt quá dung lượng file cho phép (100MB)' , data: data});
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            res.render('index', { message: 'Vượt quá số lượng file tải lên đồng thời (2 File)', data: data});
        }
        else {
            res.render('index', { message: err.message, data: data});
        }
        next(err);
    }
    );


router.get('/', async function (req, res, next) {
  const ACCOUNT = mongo.model('TaiKhoan', account, 'profile');
  const data = await ACCOUNT.find({});
  res.render('index', {title: 'Express', data:data});
});
router.get('/api/getPersonalInfo', async function(req, res, next) {
    const ACCOUNT = mongo.model('TaiKhoan', account, 'profile');
    const data = await ACCOUNT.find({});
    const mapping = await data.map((item) => {
        let urlImg;
        if (item.hinhAnh == null) {
            urlImg = ""
        } else {
            urlImg = item.hinhAnh;
        }
        return {
            id: item._id,
            ten: item.ten,
            hinhAnh: urlImg
        }
    })
    res.end(JSON.stringify(mapping));
});

module.exports = router;
