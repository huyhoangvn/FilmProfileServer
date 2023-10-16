const express = require("express");
const router = express.Router();
const MulterConfigs = require("../config/MulterConfigs");
const {fileLoader} = require("ejs");
const {lazyrouter} = require("express/lib/application");
const {log} = require("debug");
const {ObjectId} = require("mongodb");
//Model
const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung')
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require('../database/BanBe');
const Thich = require('../database/Thich');
//Controller
const {getBaiDangBanBe, getBaiDangCaNhan,ThemBaiDang} = require('../controller/DangBaiController');
const {ThemLike, XoaLike, GetAllLike} = require("../controller/LikeController");
const {ThemTaiKhoan, DangNhap, GetThongTinCaNhan} = require("../controller/NguoiDungController");
const {ThemPhim, IsPhimTrongDanhSach, XoaKhoiDanhSach, GetDiemDanhGia, GetDanhSach, SuaDanhGia} = require("../controller/PhimController");
const {ThemBanBe, XoaBanBe, GetDanhSachTimNguoiDung, IsTheoDoi, GetDanhSachBanBe, getSoLuongNguoiTheoDoi, getSoLuongTheoDoi} = require("../controller/BanBeController");


//api đăng kí
//vd: taiKhoan: admin, matKhau: a
//nếu chưa tồn tại tài khoản này thì hiện ra JSON data: bao gồm thông tin cá nhân và message đăng kí thành công
//nếu đã tồn tại tài khoản thì sẽ trả về data rỗng và message đăng ký thất bại
//link local: http://localhost:3002/api/themTaiKhoan
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/themTaiKhoan
router.post("/themTaiKhoan",MulterConfigs.upload.array("hinhAnh", 1),ThemTaiKhoan);

//api đăng nhập
//VD: taiKhoan: Quyet, matKhau: Quyet
//Tìm kiếm trong database theo tài khoản mật khẩu
//Nếu đúng tài khoản và mật khẩu thì cho phép đăng nhập và trả về thông tin cá nhân của tài khoản đăng nhập
//Nếu sai thì sẽ hiện ra message sai thông tin đăng nhập
//link local: http://localhost:3002/api/dangNhap
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/dangNhap
router.post("/dangNhap", DangNhap);

//apiGetThongTinCaNhan
//bên react sẽ gửi về id của người dùng sau đó tìm kiếm nguòi dùng theo id và trả về thông tin cá nhân
//link local: http://localhost:3002/api/getThongTinCaNhan/:id
//vd: http://localhost:3002/api/getThongTinCaNhan/65138141d7cf634a93bb9ef3
router.get("/getThongTinCaNhan/:idNguoiDung", GetThongTinCaNhan);

//apiSuaThongTin
//bên react sẽ trả về id sau đó  từ id sẽ cập nhật thông tin của người dùng theo id được trả về
//link local: http://localhost:3002/api/suaThongTin/:id
//vd: http://localhost:3002/api/suaThongTin/65138141d7cf634a93bb9ef3
router.post( "/suaThongTin/:idNguoiDung",
  MulterConfigs.upload.array("hinhAnh", 1),
  async function (req, res, next) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const hoTen = req.body.hoTen;
    const ngaySinh = req.body.ngaySinh;
    const gioiTinh = req.body.gioiTinh;
    const moTa = req.body.moTa;
    const hinhAnh = req.files.map((file) => file.filename);
    let img = "";
    if (hinhAnh.length > 0) {
      img = hinhAnh[0];
    } else {
      //Nếu ảnh tải lên rỗng thì mình lấy cái ảnh cũ của người dùng thôi
      // await query.findOne({idNguoiDung: id}).then(result => {
      //     img = result.hinhAnh[0]
      // })
      //Chắc vậy
      //Có thể lấy luôn hoTen, NgaySinh, GioiTinh cũ nếu truyền vào rỗng luôn
      //VD: hoTen = result.hoTen,...
    }
    const filter = { _id: idNguoiDung };
    let update = {
      hoTen: hoTen,
      ngaySinh: ngaySinh,
      gioiTinh: gioiTinh,
      moTa: moTa,
      hinhAnh: img,
    };
    var data = await NguoiDung.findOneAndUpdate(filter, update, { new: true });

    res.end(
      JSON.stringify({
        data,
        message: "Sửa thành công",
      })
    );
  },
  async function (err, req, res, next) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.end(
        JSON.stringify({
          data: {},
          message: "Vượt quá dung lượng file cho phép (100MB)",
        })
      );
    } else if (err.code === "LIMIT_FILE_COUNT") {
      res.end(
        JSON.stringify({
          data: {},
          message: "Vượt quá số lượng file tải lên đồng thời (1 File)",
        })
      );
    } else {
      res.end(JSON.stringify({ data: {}, message: "" + err.message }));
    }
  }
);

//apiThemPhim
//Bên react gửi về idNguoiDung rồi thêm phim vào danh sách
//link local: http://localhost:3002/api/themPhim/:id
//vd: http://localhost:3002/api/themPhim/65138141d7cf634a93bb9ef3
router.post("/themPhim/:idNguoiDung", MulterConfigs.upload.array("hinhAnh", 1),ThemPhim);

//apiPhimTrongDanhSach
//Hàm này để xác định xem phim đã tồn tại trong danh sách hay chưa
//link local: http://localhost:3002/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: http://localhost:3002/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
router.get("/isPhimTrongDanhSach/:idPhim/:idNguoiDung",IsPhimTrongDanhSach);

//apiXoaKhoiDanhSach
//Hàm này dùng để thay đổi trạng thái rồi xóa khỏi giao diện
//link local: http://localhost:3002/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: http://localhost:3002/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
router.get("/xoaKhoiDanhSach/:idPhim/:idNguoiDung", XoaKhoiDanhSach);

// Lấy api lấy trung bình điểm đánh giá phim của người dùng ứng dụng theo id phim
//link local: http://localhost:3002/api/getDiemDanhGia/:idPhim
//vd: http://localhost:3002/api/getDiemDanhGia/512218 (Id phim Transformer)
//Trả về N/A nếu phim không có đánh giá và điểm trung bình nếu có
router.get("/getDiemDanhGia/:idPhim", GetDiemDanhGia);

//apigetDanhSach
//Hàm này dùng để tìm kiếm theo idNguoiDung, trangThaiXem, yeuThich, danhGia, temPhim
//link local: http://localhost:3002/api/getDanhSach/idNguoiDung?yeuThich=-1&trangThaiXem=-1&tenPhim=-1&danhGia=-1
//vd: http://localhost:3002/api/getDanhSach/651b07d81b75b48fecf2016a?yeuThich=-1&trangThaiXem=-1&tenPhim=-1&danhGia=-1(tìm kiếm tất cả  phim của người dùng này)
router.get("/getDanhSach/:idNguoiDung", GetDanhSach);

//Sửa đánh giá phim của người dùng hiện tại
//VD: http://localhost:3002/api/getDanhSach/65250e1428c7217419ff3e9d?yeuThich=-1&trangThaiXem=-1&tenPhim=-1&danhGia=-1
router.post("/suaDanhGia/:idNguoiDung/:idPhim", SuaDanhGia);

//Thêm bài đăng từ đánh giá phim của người dùng hiện tại
//VD: http://localhost:3002/api/themBaiDang/6523a07b075e06d97c19dda0/6523a035075e06d97c19dd9d
//raw: {"chuDe":"Đây là chủ đề của tôi", "noiDung":"Đây là nội dung của tôi"}
router.post('/themBaiDang/:idNguoiDung/:idDanhGiaPhim', ThemBaiDang);

//Hiển thị tất cả bài đăng cá nhân
//VD: http://localhost:3002/api/getBaiDangCaNhan/6523a035075e06d97c19dd9d
router.get('/getBaiDangCaNhan/:idNguoiDung', getBaiDangCaNhan);

//Hiển thị tất cả bài đăng của bạn bè
//VD: http://localhost:3002/api/getBaiDangBanBe/6523a07b075e06d97c19dda0
router.get('/getBaiDangBanBe/:idNguoiDung', getBaiDangBanBe);

//Thêm bạn bè vào danh sách
//VD: http://localhost:3002/api/themBanBe/652ab58d440cfc94ac6f7fb5/6523a035075e06d97c19dd9d
router.get("/themBanBe/:idNguoiDung/:idTheoDoi", ThemBanBe);

//Xóa bạn bè khỏi danh sách
//VD: http://localhost:3002/api/themBanBe/652ab58d440cfc94ac6f7fb5/6523a035075e06d97c19dd9d
router.get("/xoaBanbe/:idNguoiDung/:idTheoDoi", XoaBanBe);


//Lấy danh sách người dùng và hiển thị nếu người dùng đó mình đã theo dõi hay chưa
//VD: http://localhost:3002/api/getDanhSachTimNguoiDung/6523a07b075e06d97c19dda0?timKiemTen=P&trang=1 (Mỗi trang hiển thị 10 người)
router.get('/getDanhSachTimNguoiDung/:idNguoiDung', GetDanhSachTimNguoiDung);

//Lấy danh sách bạn bè mình đã theo dõi
//VD: http://localhost:3002/api/getDanhSachBanBe/6523a07b075e06d97c19dda0?trang=1 (Mỗi trang hiển thị 10 người)
router.get('/getDanhSachBanBe/:idNguoiDung', GetDanhSachBanBe);

//Kiểm tra xem người dùng có thuộc danh sách kết bạn của người dùng hiện tại hay không
//VD: http://localhost:3002/api/isTheoDoi/6523a07b075e06d97c19dda0/6523a035075e06d97c19dd9d
router.get('/isTheoDoi/:idNguoiDungHienTai/:idNguoiDungBatKy', IsTheoDoi);

//Số lượt được theo dõi
//VD: http://localhost:3002/api/getSoLuongNguoiTheoDoi/6523a035075e06d97c19dd9d
router.get('/getSoLuongNguoiTheoDoi/:idNguoiDung', getSoLuongNguoiTheoDoi);

//Số lượt theo dõi bạn bè
//VD: http://localhost:3002/api/getSoLuongTheoDoi/6523a035075e06d97c19dd9d
router.get('/getSoLuongTheoDoi/:idNguoiDung', getSoLuongTheoDoi);

//api them-like
//VD: http://localhost:3002/api/themLike/6523a07b075e06d97c19dda0/6523a035075e06d97c19dd9d
router.post('/themLike/:idNguoiDung/:idBaiDang', ThemLike);

//api xoa-like
//VD: http://localhost:3002/api/xoaLike/6523a07b075e06d97c19dda0/6523a035075e06d97c19dd9d
router.get('/xoaLike/:idNguoiDung/:idBaiDang', XoaLike);

//api getAllLike
//http://localhost:3002/api/getAllLike/65280d389853ef2ecd3c9020
router.get('/getAllLike/:idBaiDang', GetAllLike);

module.exports = router;
