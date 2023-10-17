const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");
const Thich = require("../database/Thich");

const ThemLike = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const idBaiDang = new mongo.Types.ObjectId(req.params.idBaiDang);
    let data;
    let message = "";
    const result = await Thich.find({idNguoiDung:idNguoiDung, idBaiDang: idBaiDang});
    if(result.length > 0){
        if(result[0].trangThai == 0){
            data = await Thich.findOneAndUpdate({idNguoiDung:idNguoiDung, idBaiDang: idBaiDang}, {trangThai:1}, {new: true});
            message = "Thích thành công";
        } else {
            message = "Đã thích";
        }
    } else {
        data = await Thich.create({
            idNguoiDung:idNguoiDung,
            idBaiDang: idBaiDang,
            trangThai : 1,
        })
        message = "Thích thành công";
    }

    res.end(JSON.stringify({
        data,
        message:message
    }));
}
const XoaLike = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const idBaiDang = new mongo.Types.ObjectId(req.params.idBaiDang);
    const filter = {idNguoiDung: idNguoiDung, idBaiDang: idBaiDang}
    const update = {trangThai : 0}
    const data = await Thich.findOneAndUpdate(filter, update, { new: true })

    res.end(JSON.stringify({
        data,
        message:'Xóa Like thành công'
    }));
}

const GetAllLike = async function (req, res, next) {
    const id = new mongo.Types.ObjectId(req.params.idBaiDang);
    let data = 0;
    const query = await Thich
        .aggregate([
            {
                $match: {
                    idBaiDang: id,
                    trangThai: 1
                },
            },
            {
                $count: "tong"
            }
        ])
        .then((result) => {
            if (result.length > 0) {
                data = result[0].tong
            }
        });



    res.end(
        JSON.stringify({
            data,
            message: "Thành công",
        })
    );
}

module.exports = {
    ThemLike,
    XoaLike,
    GetAllLike
}
