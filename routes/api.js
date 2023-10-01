const express = require('express');
const router = express.Router();
const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung')
const danhGiaPhim = require('../database/danhGiaPhim');
const MulterConfigs = require("../config/MulterConfigs");
const {fileLoader} = require("ejs");

//api đăng kí
//vd: taiKhoan: admin, matKhau: a
//nếu chưa tồn tại tài khoản này thì hiện ra JSON data: bao gồm thông tin cá nhân và message đăng kí thành công
//nếu đã tồn tại tài khoản thì sẽ trả về data rỗng và message đăng ký thất bại
//link local: http://localhost:3002/api/themTaiKhoan
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/themTaiKhoan
router.post('/themTaiKhoan', MulterConfigs.upload.array('hinhAnh',1), async function (req, res) {
        const taiKhoan = req.body.taiKhoan
        const matKhau = req.body.matKhau
        const hoTen = req.body.hoTen
        const hinhAnh = 'logofpt.png';
        var objId ;
        var item = await NguoiDung.findOne(NguoiDung.where({taiKhoan: taiKhoan}))
        console.log("item day"+item)
        if (item == null){
            await NguoiDung.create({
                taiKhoan:taiKhoan,
                matKhau:matKhau,
                hoTen:hoTen,
                ngaySinh:"dd-mm-yyyy",
                gioiTinh:2,
                moTa:"gioi thieu",
                hinhAnh: hinhAnh,
                trangThai:1
            }).then(result => {objId = result._id})

            res.end(JSON.stringify({
                data:{
                    id:objId,
                    hoTen:hoTen,
                    ngaySinh:"dd-mm-yyyy",
                    gioiTinh:2,
                    moTa:"gioi thieu",
                    hinhAnh: hinhAnh,
                    trangThai:1},
                message:'Dang ki thanh cong'
            }));
        }else{
            res.end(JSON.stringify({data: {}, message: "Tai khoan da ton tai"}));
        }
    });


//api đăng nhập
//VD: taiKhoan: Quyet, matKhau: Quyet
//Tìm kiếm trong database theo tài khoản mật khẩu
//Nếu đúng tài khoản và mật khẩu thì cho phép đăng nhập và trả về thông tin cá nhân của tài khoản đăng nhập
//Nếu sai thì sẽ hiện ra message sai thông tin đăng nhập
//link local: http://localhost:3002/api/dangNhap
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/dangNhap
router.post('/dangNhap', async function (req, res,next) {
    const username = req.body.taiKhoan;
    const password = req.body.matKhau;
    const query = NguoiDung.where({taiKhoan: username, matKhau: password})
    var item = await query.findOne();

    if (item == null){
        res.end(JSON.stringify({data: {}, message: "dang nhap that bai"}));
    }else{
        res.end(JSON.stringify({
            data:{
                id:item._id,
                taiKhoan:item.taiKhoan,
                matKhau: item.matKhau,
                hoTen:item.hoTen,
                ngaySinh:item.ngaySinh,
                gioiTinh:item.gioiTinh,
                moTa: item.moTa,
                hinhAnh: req.protocol + '://' + req.get('host') +"/public/images/" + item.hinhAnh,
                trangThai: item.trangThai},
            message:"dang nhap thanh cong"
            }));
    }
});

// lay api thong tin ca nhan
//bên react sẽ gửi về id của người dùng sau đó tìm kiếm nguòi dùng theo id và trả về thông tin cá nhân
//link local: http://localhost:3002/api/getThongTinCaNhan/:id
//vd: http://localhost:3002/api/getThongTinCaNhan/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/getThongTinCaNhan/:id
//vd: https://gratis-dusty-cabinet.glitch.me/api/getThongTinCaNhan/65138141d7cf634a93bb9ef3
router.get('/getThongTinCaNhan/:id', async function(req, res, next) {
    const id = req.params.id;
    const query = NguoiDung.where({_id:id})
    const item = await query.findOne();

    res.end(JSON.stringify({
        data:{
            id:item._id,
            hoTen: item.hoTen,
            ngaySinh: item.ngaySinh,
            gioiTinh: item.gioiTinh,
            moTa: item.moTa,
            hinhAnh: req.protocol + '://' + req.get('host') +"/public/images/"  + item.hinhAnh,
            trangThai: item.trangThai},
        message: "lay thanh cong"}));
});
//api sua thong tin ca nhan
//ben react sẽ trả về id sau đó  từ id sẽ cập nhật thông tin của người dùng theo id được trả về
//link local: http://localhost:3002/api/suaThongTin/:id
//vd: http://localhost:3002/api/suaThongTin/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/suaThongTin/:id
//vd: https://gratis-dusty-cabinet.glitch.me/api/suaThongTin/65138141d7cf634a93bb9ef3
router.post('/suaThongTin/:id', MulterConfigs.upload.array('hinhAnh',1), async function (req, res, next) {
    const id = req.params.id;
    const hoTen = req.body.hoTen;
    const ngaySinh = req.body.ngaySinh;
    const gioiTinh = req.body.gioiTinh;
    const moTa = req.body.moTa;
    const hinhAnh = req.files.map(file => file.filename);
    let img = "";
    if (hinhAnh.length > 0){
        img = hinhAnh[0];
    }
    const filter = {_id: id};
    let update = {
        hoTen: hoTen,
        ngaySinh: ngaySinh,
        gioiTinh: gioiTinh,
        moTa: moTa,
        hinhAnh: img}
    var item = await NguoiDung.findOneAndUpdate(filter, update, {new : true})

    res.end(JSON.stringify({
        data:{
            id:item._id,
        },
        message: "Sua thanh cong"}));
},
    async function (err, req, res, next) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            res.end(JSON.stringify({data:{}, message:"Vượt quá dung lượng file cho phép (100MB)"}))
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            res.end(JSON.stringify({data:{}, message:"Vượt quá số lượng file tải lên đồng thời (1 File)"}))
        }
        else {
            res.end(JSON.stringify({data:{}, message:"" + err.message}))
        }

    }
);
module.exports = router;
