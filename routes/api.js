const express = require('express');
const router = express.Router();
const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung')
const MulterConfigs = require("../config/MulterConfigs");

//
router.post('/themTaiKhoan', MulterConfigs.upload.array('hinhAnh',1), async function (req, res) {
        const taiKhoan = req.body.taiKhoan
        const matKhau = req.body.matKhau
        const hoTen = req.body.hoTen
        const hinhAnh = 'https://gratis-dusty-cabinet.glitch.me/uploads/logofpt.png';
        var objId ;
        var item = await NguoiDung.find({taiKhoan: taiKhoan})

        if (item[0] == null){
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
            const data = await NguoiDung.find({_id: objId});
            res.end(JSON.stringify({
                id:data[0]._id,
                hoTen:data[0].hoTen,
                ngaySinh:data[0].ngaySinh,
                gioiTinh:data[0].gioiTinh,
                moTa:data[0].moTa,
                hinhAnh:data[0].hinhAnh,
                trangThai:data[0].trangThai,
                message:'Dang ki thanh cong'}));
        }else{
            res.end(JSON.stringify({data: {}, message: "Tai khoan da ton tai"}));
        }
    });
router.post('/dangNhap', async function (req, res,next) {
    const username = req.body.taiKhoan;
    const password = req.body.matKhau;
    console.log(req.body)
    const query = NguoiDung.where({taiKhoan: username})
    var item = await query.findOne();
    console.log(item)
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
                hinhAnh: item.hinhAnh,
                trangThai: item.trangThai},
            message:"dang nhap thanh cong"}));
    }
});

module.exports = router;
