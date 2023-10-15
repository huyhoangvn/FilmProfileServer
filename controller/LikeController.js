const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");
const Thich = require("../database/Thich");

const ThemLike = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const idBaiDang = new mongo.Types.ObjectId(req.params.idBaiDang);
    const data = await Thich.create({
        idNguoiDung:idNguoiDung,
        idBaiDang: idBaiDang,
        trangThai : 1,
    })

    res.end(JSON.stringify({
        data,
        message:'Like thành công'
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
