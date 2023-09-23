const express = require('express');
const router = express.Router();
const {} = require("express");
var mongo = require('mongoose');
const {log} = require("debug");
const {route} = require("express/lib/router");
const webRoute = require('../routes/web');
// const app = express();
const multer = require('multer');
var maxSize = 100*1024*1024;
// const upload = require('../config/');
main().catch(err => console.log(err));

// Luu hinh anh
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
var upload = multer({ storage: storage, limits:{fileSize : maxSize}, fileFilter: Filter});

// /* GET home page. */
// //Ket noi mongoose
async function main(){
    await mongo.connect('mongodb+srv://phucnxph29170:Kondien123@cluster0.kutdlfc.mongodb.net/film')
}
// //Khoi tao account
const account = new mongo.Schema({
    taiKhoan: String,
    matKhau: String,
    hoTen: String,
    ngaySinh:String,
    gioiTinh:String,
    moTa:String,
    hinhAnh: [{type:String}]
});

//Thêm account
router.post('/api/themTaiKhoan', upload.array('hinhAnh',2), async function (req, res, next) {
    const taiKhoan = req.body.taiKhoan
    const matKhau = req.body.matKhau
    const hoTen = req.body.hoTen
    const ngaySinh = req.body.ngaySinh
    const gioiTinh = req.body.gioiTinh
    const moTa = req.body.moTa
    // const hinhAnh = req.files.map(file => file.filename);
    const hinhAnh = 'localhost:3002/uploads/logofpt.png';
    console.log( req)
    var objId ;
    const Account = mongo.model('TaiKhoan', account, 'profile')

    await Account.create({
        taiKhoan:taiKhoan,
        matKhau:matKhau,
        hoTen:hoTen,
        ngaySinh:ngaySinh,
        gioiTinh:gioiTinh,
        moTa:moTa,
        hinhAnh: hinhAnh
    }).then(result => {objId = result._id})
    const data = await Account.find({_id: objId});
    res.end(JSON.stringify({id:data[0]._id}));
},
    async function (err,req, res,next ) {
        console.log(err)
        const Account = mongo.model('TaiKhoan', account, 'profile')
        const data = await Account.find();
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.render('index', { message: 'Vượt quá dung lượng file cho phép (100MB)' , data: data});
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            res.render('index', { message: 'Vượt quá số lượng file tải lên đồng thời (2 File)', data: data});
        }
        else {
            res.render('index', { message: err.message, data: data});
        }
        next(err);
    });

//Them account web
router.post('/themTaiKhoan', upload.array('hinhAnh',2), async function (req, res, next) {
        const taiKhoan = req.body.taiKhoan
        const matKhau = req.body.matKhau
        const hoTen = req.body.hoTen
        const ngaySinh = req.body.ngaySinh
        const gioiTinh = req.body.gioiTinh
        const moTa = req.body.moTa
        // const hinhAnh = req.files.map(file => file.filename);
        const hinhAnh = 'localhost:3002/uploads/logofpt.png';
        const Account = mongo.model('TaiKhoan', account, 'profile')

        await Account.create({
            taiKhoan:taiKhoan,
            matKhau:matKhau,
            hoTen:hoTen,
            ngaySinh:ngaySinh,
            gioiTinh:gioiTinh,
            moTa:moTa,
            hinhAnh: hinhAnh
        });
        const data = await Account.find();
        res.render('index', { data: data, message:'them thanh cong!!!'})
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
  const Account = mongo.model('TaiKhoan', account, 'profile');
  const data = await Account.find({});
  res.render('index', {title: 'Express', data:data});
});
router.get('/login', async function (req, res, next) {
    const Account = mongo.model('TaiKhoan', account, 'profile');
    const data = await Account.find({});
    res.render('login', {title: 'Express', data:data});
});
router.post('/dangNhap', async function (req, res, next) {
    const username = req.body.taiKhoan;
    const password = req.body.matKhau;
    const Account = mongo.model('TaiKhoan', account, 'profile');
    const data = await Account.find({});
    var item = await Account.find({taiKhoan: username, matKhau: password})
    console.log(item)
    if (item[0] == null){
        res.render('login', { message: 'sai thong tin dang nhap' , data: data});
    }else if (item[0]._id != null){
        // res.render('dashboard', {title: 'Express', data:data});
        res.end(JSON.stringify({id:item[0]._id}));

    }
});
router.get('/dashboard', async function (req, res, next) {
    const Account = mongo.model('TaiKhoan', account, 'profile');
    const data = await Account.find({});
    res.render('dashboard', {title: 'Express', data:data});
});

//lay api thong tin ca nhan
router.get('/api/getPersonalInfo', async function(req, res, next) {
    const Account = mongo.model('TaiKhoan', account, 'profile');
    const data = await Account.find({});
    const mapping = await data.map((item) => {
        let urlImg;
        if (item.hinhAnh == null) {
            urlImg = ""
        } else {
            urlImg = item.hinhAnh;
        }
        return {
            id: item._id,
            hoTen: item.hoTen,
            gioiTinh: item.gioiTinh,
            ngaySinh: item.ngaySinh,
            hinhAnh: urlImg
        }
    })
    res.end(JSON.stringify(mapping));
});
module.exports = router;
