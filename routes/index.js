const express = require('express');
const router = express.Router();
// const {} = require("express");
// const {log} = require("debug");
// const {route} = require("express/lib/router");
// const webRoute = require('../routes/web');
// const app = express();

// const upload = require('../config/');
// main().catch(err => console.log(err));
const NguoiDung = require('../database/NguoiDung');
const MulterConfigs = require("../config/MulterConfigs");

// Luu hinh anh


// /* GET home page. */
// //Ket noi mongoose
// async function main(){
//     await mongo.connect('mongodb+srv://phucnxph29170:Kondien123@cluster0.kutdlfc.mongodb.net/film')
// }
// //Khoi tao NguoiDung

//Thêm NguoiDung


//Them NguoiDung web
router.post('/themTaiKhoan', MulterConfigs.upload.array('hinhAnh',1), async function (req, res) {
        const taiKhoan = req.body.taiKhoan
        const matKhau = req.body.matKhau
        const hoTen = req.body.hoTen
        const ngaySinh = req.body.ngaySinh
        const gioiTinh = req.body.gioiTinh
        const moTa = req.body.moTa
        let hinhAnh = 'https://gratis-dusty-cabinet.glitch.me/public/images/logofpt.png';
        if(req.file){
            hinhAnh = req.files.map(file => file.filename);
        }
        var item = await NguoiDung.find({taiKhoan: taiKhoan})
        if (item[0] == null){
            await NguoiDung.create({
                taiKhoan:taiKhoan,
                matKhau:matKhau,
                hoTen:hoTen,
                ngaySinh:ngaySinh,
                gioiTinh:gioiTinh,
                moTa:moTa,
                hinhAnh: hinhAnh
            });
            const data = await NguoiDung.find();
            res.render('index', { data: data, message:'them thanh cong!!!'})
        }else{
            res.end(JSON.stringify({data: {}, message: "Tai khoan da ton tai"}));
        }


    }
);
router.post('/dangNhap', async function (req, res, next) {
    const username = req.body.taiKhoan;
    const password = req.body.matKhau;
    const data = await NguoiDung.find({});
    var item = await NguoiDung.find({taiKhoan: username, matKhau: password})
    if (item[0] == null){
        // res.render('login', { message: 'sai thong tin dang nhap' , data: data});
        res.end(JSON.stringify({data: {}, message: "dang nhap that bai"}));
    }else if (item[0]._id != null){
        // res.render('dashboard', {title: 'Express', data:data});
        res.end(JSON.stringify({data:{id:item[0]._id, hoTen:item[0].hoTen, ngaySinh:item[0].ngaySinh, gioiTinh:item[0].gioiTinh, moTa: item[0].moTa, hinhAnh: item[0].hinhAnh}, message:"dang nhap thanh cong"}));
    }
});


router.get('/', async function (req, res, next) {
  const data = await NguoiDung.find({});
  res.render('index', {title: 'Express', data:data});
});

router.get('/login', async function (req, res, next) {
    const data = await NguoiDung.find({});
    res.render('login', {title: 'Express', data:data});
});


router.get('/dashboard', async function (req, res, next) {
    const data = await NguoiDung.find({});
    res.render('dashboard', {title: 'Express', data:data});
});

//lay api thong tin ca nhan
router.get('/getPersonalInfos', async function(req, res, next) {
    const data = await NguoiDung.find({});
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
