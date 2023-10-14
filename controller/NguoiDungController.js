const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");
const Thich = require("../database/Thich");

const ThemTaiKhoan = async function (req, res) {
    const taiKhoan = req.body.taiKhoan;
    const matKhau = req.body.matKhau;
    const hoTen = req.body.hoTen;
    const hinhAnh = "logofpt.png";
    var objId;
    var item = await NguoiDung.findOne(NguoiDung.where({ taiKhoan: taiKhoan }));
    if (item == null) {
        await NguoiDung.create({
            taiKhoan: taiKhoan,
            matKhau: matKhau,
            hoTen: hoTen,
            ngaySinh: "dd-mm-yyyy",
            gioiTinh: 2,
            moTa: "gioi thieu",
            hinhAnh: hinhAnh,
            trangThai: 1,
        }).then((result) => {
            objId = result._id;
        });

        res.end(
            JSON.stringify({
                data: {
                    id: objId,
                    hoTen: hoTen,
                    ngaySinh: "dd-mm-yyyy",
                    gioiTinh: 2,
                    moTa: "gioi thieu",
                    hinhAnh:
                        req.protocol +
                        "://" +
                        req.get("host") +
                        "/public/images/" +
                        hinhAnh,
                    trangThai: 1,
                },
                message: "Dang ki thanh cong",
            })
        );
    } else {
        res.end(JSON.stringify({ data: {}, message: "Tài khỏan đã tồn tại" }));
    }
}
const DangNhap = async function (req, res, next) {
    const taiKhoan = req.body.taiKhoan;
    const matKhau = req.body.matKhau;
    const query = NguoiDung.where({
        taiKhoan: taiKhoan,
        matKhau: matKhau,
        trangThai: 1,
    });
    var item = await query.findOne();

    if (item == null) {
        res.end(JSON.stringify({ data: {}, message: "Đăng nhập thất bại" }));
    } else {
        res.end(
            JSON.stringify({
                data: {
                    id: item._id,
                    taiKhoan: item.taiKhoan,
                    matKhau: item.matKhau,
                    hoTen: item.hoTen,
                    ngaySinh: item.ngaySinh,
                    gioiTinh: item.gioiTinh,
                    moTa: item.moTa,
                    hinhAnh: req.protocol + "://" + req.get("host") + "/public/images/" + item.hinhAnh,
                    trangThai: item.trangThai,
                },
                message: "Đăng nhập thành công",
            })
        );
    }
}
const GetThongTinCaNhan = async function (req, res, next) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const query = NguoiDung.where({ _id: idNguoiDung });
    const item = await query.findOne();

    res.end(
        JSON.stringify({
            data: {
                id: item._id,
                hoTen: item.hoTen,
                ngaySinh: item.ngaySinh,
                gioiTinh: item.gioiTinh,
                moTa: item.moTa,
                hinhAnh: req.protocol + "://" + req.get("host") + "/public/images/" + item.hinhAnh,
                trangThai: item.trangThai,
            },
            message: "Lấy thông tin thành công",
        })
    );
}


module.exports = {
    ThemTaiKhoan,
    DangNhap,
    GetThongTinCaNhan
}
