const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");
const Thich = require("../database/Thich");

const ThemPhim = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const idPhim = req.body.idPhim;
    const tenPhim = req.body.tenPhim;
    const hinhAnh = req.body.hinhAnh;
    //Không nên tải ảnh lên bằng mutter mà chỉ lưu link thôi là được vì mình lấy link từ api khác mà, giống như là lưu tên thôi
    //VD: https://upload.wikimedia.org/wikipedia/commons/9/92/The_death.png <= có đuôi rồi cứ lưu như string thôi
    var objId;
    var phimDaThem = await danhGiaPhim.findOne(
        danhGiaPhim.where({ idNguoiDung: idNguoiDung, idPhim: idPhim })
    );
    if (phimDaThem == null) {
        await danhGiaPhim
            .create({
                idNguoiDung: idNguoiDung,
                idPhim: idPhim,
                tenPhim: tenPhim,
                yeuThich: 1,
                danhGia: -1,
                trangThaiXem: 0,
                trangThai: 1,
                hinhAnh: hinhAnh,
            })
            .then((result) => {
                objId = result._id;
            });

        res.end(
            JSON.stringify({
                data: {
                    idNguoiDung: idNguoiDung,
                    idPhim: idPhim,
                    tenPhim: tenPhim,
                    yeuThich: 1,
                    danhGia: -1,
                    trangThaiXem: -1,
                    trangThai: 1,
                    hinhAnh: hinhAnh,
                },
                message: "Thêm phim thành công",
            })
        );
    } else {
        if (phimDaThem.trangThai == 1) {
            res.end(
                JSON.stringify({
                    data: {},
                    message: "Đã tồn tại trong danh sách",
                })
            );
        } else if (phimDaThem.trangThai == 0) {
            const filter = { idNguoiDung: idNguoiDung, idPhim: idPhim };
            let update = { trangThai: 1 };
            await danhGiaPhim.findOneAndUpdate(filter, update, { new: true });
            res.end(
                JSON.stringify({
                    data: {},
                    message: "Thêm thành công",
                })
            );
        }
    }
}
const IsPhimTrongDanhSach = async function (req, res) {
    const idPhim = req.params.idPhim;
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    var phimDaThem = await danhGiaPhim.findOne(
        danhGiaPhim.where({
            idNguoiDung: idNguoiDung,
            idPhim: idPhim,
            trangThai: 1,
        })
    );
    if (phimDaThem == null) {
        res.end(
            JSON.stringify({
                data: false,
                message: "Chưa tồn tại trong danh sách",
            })
        );
    } else {
        res.end(
            JSON.stringify({
                data: true,
                message: "Đã tồn tại trong danh sách",
            })
        );
    }
}

const XoaKhoiDanhSach = async function (req, res) {
    const idPhim = req.params.idPhim;
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    var phimDaThem = await danhGiaPhim.findOne(
        danhGiaPhim.where({
            idPhim: idPhim,
            idNguoiDung: idNguoiDung,
            trangThai: 1,
        })
    );
    console.log("phim day" + phimDaThem);
    if (phimDaThem == null) {
        res.end(
            JSON.stringify({
                data: {},
                message: "Chưa tồn tại trong danh sách",
            })
        );
    } else {
        const filter = { idPhim: idPhim, idNguoiDung: idNguoiDung };
        let update = { trangThai: 0 };
        await danhGiaPhim.findOneAndUpdate(filter, update, { new: true });
        res.end(
            JSON.stringify({
                data: {},
                message: "Xóa thành công",
            })
        );
    }
}

const GetDiemDanhGia = async function (req, res, next) {
    const id = req.params.idPhim;
    let ketQuaDanhGia = -1;
    const query = await danhGiaPhim
        .aggregate([
            {
                $match: {
                    idPhim: id,
                    trangThai: 1,
                    danhGia: { $not: { $eq: -1 } },
                },
            },
            {
                $group: {
                    _id: null,
                    rating: {
                        $avg: { $sum: "$danhGia" },
                    },
                },
            },
        ])
        .then((result) => {
            if (result.length > 0) {
                ketQuaDanhGia = result[0].rating;
            }
        });

    res.end(
        JSON.stringify({
            data: {
                ketQuaDanhGia,
            },
            message: "Thành công",
        })
    );
}

const GetDanhSach = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const trangThaiXem = req.query.trangThaiXem != -1 ? req.query.trangThaiXem : [-1, 0, 1, 2];
    const yeuThich = req.query.yeuThich != -1 ? req.query.yeuThich : [0, 1];
    const diemDanhGia = req.query.danhGia != -1 ? req.query.danhGia : [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const tenPhim = req.query.tenPhim != "-1" ? "^" + req.query.tenPhim : "\\w+";
    var data = await danhGiaPhim.find({
        tenPhim: { $regex: tenPhim },
        danhGia: { $in: diemDanhGia },
        yeuThich: { $in: yeuThich },
        trangThaiXem: { $in: trangThaiXem },
        idNguoiDung: idNguoiDung,
        trangThai:1

    });
    res.end(
        JSON.stringify({
            data: data,
            message: "Thành công",
        })
    );
}

const SuaDanhGia = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const idPhim = req.params.idPhim;
    const trangThaiXem = req.query.trangThaiXem;
    const yeuThich = req.query.yeuThich;
    const danhGia = req.query.danhGia;
    const filter = { idNguoiDung: idNguoiDung, idPhim: idPhim, trangThai: 1 };

    let update = {
        danhGia: danhGia,
        trangThaiXem: trangThaiXem,
        yeuThich: yeuThich,
    };

    var data = await danhGiaPhim.findOneAndUpdate(filter, update, { new: true });
    res.end(
        JSON.stringify({
            data,
            message: "Sửa thành công",
        })
    );
}

module.exports = {
    ThemPhim ,
    IsPhimTrongDanhSach,
    XoaKhoiDanhSach,
    GetDiemDanhGia,
    GetDanhSach,
    SuaDanhGia
}
