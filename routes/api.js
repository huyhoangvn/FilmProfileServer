const express = require("express");
const router = express.Router();

const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung')
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require('../database/BanBe');
const MulterConfigs = require("../config/MulterConfigs");
const {fileLoader} = require("ejs");
const {lazyrouter} = require("express/lib/application");
const {log} = require("debug");
const {ObjectId} = require("mongodb");

//api đăng kí
//vd: taiKhoan: admin, matKhau: a
//nếu chưa tồn tại tài khoản này thì hiện ra JSON data: bao gồm thông tin cá nhân và message đăng kí thành công
//nếu đã tồn tại tài khoản thì sẽ trả về data rỗng và message đăng ký thất bại
//link local: http://localhost:3002/api/themTaiKhoan
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/themTaiKhoan
router.post("/themTaiKhoan",MulterConfigs.upload.array("hinhAnh", 1),
  async function (req, res) {
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
);

//api đăng nhập
//VD: taiKhoan: Quyet, matKhau: Quyet
//Tìm kiếm trong database theo tài khoản mật khẩu
//Nếu đúng tài khoản và mật khẩu thì cho phép đăng nhập và trả về thông tin cá nhân của tài khoản đăng nhập
//Nếu sai thì sẽ hiện ra message sai thông tin đăng nhập
//link local: http://localhost:3002/api/dangNhap
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/dangNhap
router.post("/dangNhap", async function (req, res, next) {
  const username = req.body.taiKhoan;
  const password = req.body.matKhau;
  const query = NguoiDung.where({
    taiKhoan: username,
    matKhau: password,
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
          hinhAnh:
            req.protocol +
            "://" +
            req.get("host") +
            "/public/images/" +
            item.hinhAnh,
          trangThai: item.trangThai,
        },
        message: "Đăng nhập thành công",
      })
    );
  }
});

//apiGetThongTinCaNhan
//bên react sẽ gửi về id của người dùng sau đó tìm kiếm nguòi dùng theo id và trả về thông tin cá nhân
//link local: http://localhost:3002/api/getThongTinCaNhan/:id
//vd: http://localhost:3002/api/getThongTinCaNhan/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/getThongTinCaNhan/:id
//vd: https://gratis-dusty-cabinet.glitch.me/api/getThongTinCaNhan/65138141d7cf634a93bb9ef3
router.get("/getThongTinCaNhan/:id", async function (req, res, next) {
  const id = req.params.id;
  const query = NguoiDung.where({ _id: id });
  const item = await query.findOne();

  res.end(
    JSON.stringify({
      data: {
        id: item._id,
        hoTen: item.hoTen,
        ngaySinh: item.ngaySinh,
        gioiTinh: item.gioiTinh,
        moTa: item.moTa,
        hinhAnh:
          req.protocol +
          "://" +
          req.get("host") +
          "/public/images/" +
          item.hinhAnh,
        trangThai: item.trangThai,
      },
      message: "Lấy thông tin thành công",
    })
  );
});

//apiSuaThongTin
//bên react sẽ trả về id sau đó  từ id sẽ cập nhật thông tin của người dùng theo id được trả về
//link local: http://localhost:3002/api/suaThongTin/:id
//vd: http://localhost:3002/api/suaThongTin/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/suaThongTin/:id
//vd: https://gratis-dusty-cabinet.glitch.me/api/suaThongTin/65138141d7cf634a93bb9ef3
router.post( "/suaThongTin/:id",
  MulterConfigs.upload.array("hinhAnh", 1),
  async function (req, res, next) {
    const id = req.params.id;
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
    const filter = { _id: id };
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
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/themPhim/:id
//vd: https://gratis-dusty-cabinet.glitch.me/api/themPhim/65138141d7cf634a93bb9ef3
router.post(
  "/themPhim/:idNguoiDung",
  MulterConfigs.upload.array("hinhAnh", 1),
  async function (req, res) {
    const idNguoiDung = req.params.idNguoiDung;
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
);

//apiPhimTrongDanhSach
//Hàm này để xác định xem phim đã tồn tại trong danh sách hay chưa
//link local: http://localhost:3002/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: http://localhost:3002/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: https://gratis-dusty-cabinet.glitch.me/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
router.get("/isPhimTrongDanhSach/:idPhim/:idNguoiDung",
  async function (req, res) {
    const idPhim = req.params.idPhim;
    const idNguoiDung = req.params.idNguoiDung;
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
);

//apiXoaKhoiDanhSach
//Hàm này dùng để thay đổi trạng thái rồi xóa khỏi giao diện
//link local: http://localhost:3002/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: http://localhost:3002/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
//linh glitch: https://gratis-dusty-cabinet.glitch.me/api/isPhimTrongDanhSach/:idPhim/:idNguoiDung
//vd: https://gratis-dusty-cabinet.glitch.me/api/isPhimTrongDanhSach/512218/65138141d7cf634a93bb9ef3
router.get("/xoaKhoiDanhSach/:idPhim/:idNguoiDung", async function (req, res) {
  const idPhim = req.params.idPhim;
  const idNguoiDung = req.params.idNguoiDung;
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
});

// router.get('/getAll/:idNguoiDung', async function (req, res) {
//     const idNguoiDung = req.params.idNguoiDung;
//     var data = await danhGiaPhim.find({});
//     res.end(JSON.stringify({
//         data:data,
//         message:'Lấy tất cả thành công'
//     }));
// });

// Lấy api lấy trung bình điểm đánh giá phim của người dùng ứng dụng theo id phim
//link local: http://localhost:3002/api/getDiemDanhGia/:idPhim
//vd: http://localhost:3002/api/getDiemDanhGia/512218 (Id phim Transformer)
//Trả về N/A nếu phim không có đánh giá và điểm trung bình nếu có
router.get("/getDiemDanhGia/:idPhim", async function (req, res, next) {
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
});

//apigetDanhSach
//Hàm này dùng để tìm kiếm theo idNguoiDung, trangThaiXem, yeuThich, danhGia, temPhim
//link local: http://localhost:3002/api/getDanhSach/idNguoiDung?yeuThich=-1&trangThaiXem=-1&tenPhim=-1&danhGia=-1
//vd: http://localhost:3002/api/getDanhSach/651b07d81b75b48fecf2016a?yeuThich=-1&trangThaiXem=-1&tenPhim=-1&danhGia=-1(tìm kiếm tất cả  phim của người dùng này)
router.get("/getDanhSach/:idNguoiDung", async function (req, res) {
  const idNguoiDung = req.params.idNguoiDung;
  const trangThaiXem =
    req.query.trangThaiXem != -1 ? req.query.trangThaiXem : [-1, 0, 1, 2];
  const yeuThich = req.query.yeuThich != -1 ? req.query.yeuThich : [0, 1];
  const diemDanhGia =
    req.query.danhGia != -1
      ? req.query.danhGia
      : [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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
});

router.post("/suaDanhGia/:idNguoiDung/:idPhim", async function (req, res) {
  const idNguoiDung = req.params.idNguoiDung;
  const idPhim = req.params.idPhim;
  const trangThaiXem = req.query.trangThaiXem;
  const yeuThich = req.query.yeuThich;
  const danhGia = req.query.danhGia;
  const filter = { idNguoiDung: idNguoiDung, idPhim: idPhim };

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
});
// api them ban be 
router.get("/get-ban-be/:idNguoiDung", async function (req, res) {
  const idTheoDoi = req.params.idTheoDoi;
  const idNguoiDung = req.params.idNguoiDung;
  const trangThai = req.query.trangThai;
  var themBanBe = await NguoiDung.findOne(
    NguoiDung.where({ idNguoiDung: idNguoiDung, trangThai: 1 })
  );
  if (themBanBe == null) {
    await NguoiDung.create({
      idTheoDoi: idTheoDoi,
      idNguoiDung: idNguoiDung,
      trangThai: 1,
    }).then((result) => {
      id = result._id;
    });
    res.end(
      JSON.stringify({
        data: {
          idTheoDoi: idTheoDoi,
          idNguoiDung: idNguoiDung,
          trangThai: 1,
        },
        message: "Ket ban thanh cong",
      })
    );
  } else {
    res.end(JSON.stringify({ data: {}, message: "Tài khỏan đã tồn tại" }));
  }
});

// api themBaiDang
router.post('/themBaiDang/:idNguoiDung/:idDanhGiaPhim', async function (req, res) {
    const idNguoiDung = req.params.idNguoiDung
    const idDanhGiaPhim = req.params.idDanhGiaPhim
    const chuDe = req.body.chuDe
    const noiDung = req.body.noiDung
    const ngayTao = req.body.ngayTao
    const trangThai = req.body.trangThai

    const data = await baiDang.create({
        idNguoiDung:idNguoiDung,
        idDanhGiaPhim: idDanhGiaPhim,
        chuDe:chuDe,
        noiDung:noiDung,
        ngayTao:ngayTao,
        trangThai:trangThai,
    });
    console.log(data)

        res.end(JSON.stringify({
            data:{
                idNguoiDung:idNguoiDung,
                idDanhGiaPhim: idDanhGiaPhim,
                chuDe:chuDe,
                noiDung:noiDung,
                ngayTao:ngayTao,
                trangThai:trangThai,
            },
            message:'Thêm bài đăng thành công'
        }));
});

// api baiDangCaNhan
router.get('/getBaiDangCaNhan/:idNguoiDung', async function (req, res) {
    const idNguoiDung = req.params.idNguoiDung;
    var data = await baiDang.find({idNguoiDung: idNguoiDung})
    res.end(JSON.stringify({
        data,
        message:'Thành công'
    }));
});

router.get('/getBaiDangVaBanBe/:idNguoiDung',async function (req,res){
    const idNguoiDung = req.params.idNguoiDung;
    var tenNguoiDung = await BanBe.aggregate([
        {$match: {
            idNguoiDung: idNguoiDung
        }},
        {$addFields: {
            convertedId: { $toObjectId: "$idTheoDoi" }
        }},
        {$lookup: {
            from: "BaiDang",
            localField: "idTheoDoi",
            foreignField: "idNguoiDung",
            as: "BaiDang"
        }},
        {$lookup: {
            from: "NguoiDung",
            localField: "convertedId",
            foreignField: "_id",
            as: "NguoiDung"
        }},
        {$lookup: {
            from: "DanhGiaPhim",
            localField: "idTheoDoi",
            foreignField: "idNguoiDung",
            as: "DanhGiaPhim"
        }},
        {$unwind: {
                path: "$DanhGiaPhim",
                preserveNullAndEmptyArrays: false
        }},
        {$unwind: {
                path: "$NguoiDung",
                preserveNullAndEmptyArrays: false
            }},
        {$unwind: {
                path: "$BaiDang",
                preserveNullAndEmptyArrays: false
            }}
    ]);
    const mapping = await tenNguoiDung.map((item) => {
        return {
            id: item._id,
            hoTen: item.NguoiDung.hoTen,
            ngayTao: item.BaiDang.ngayTao,
            noiDung: item.BaiDang.noiDung,
            chuDe: item.BaiDang.chuDe,
            danhGia: item.DanhGiaPhim.danhGia,
            tenPhim: item.DanhGiaPhim.tenPhim,
            hinhAnhNguoiDung: item.NguoiDung.hinhAnh,
            hinhAnhPhim: item.DanhGiaPhim.hinhAnh

        }
    })

    res.json({
        mapping,
        message:'Thanh Cong'
    });
});


router.get("/getthembanbe", async (req, res) => {
  try {
    const themBanBe = await BanBe.find().populate("idTheoDoi");
    res.status(200).json(themBanBe);
  } catch (err) {
    res.status(500).json({
      data:{

      }
    });
  }
});

// api xóa bạn bè 
router.get("/getxoabanbe/:idTheoDoi/idNguoiDung", async (req,res) => {
  const idTheoDoi = req.params.idTheoDoi;
  const idNguoiDung = req.params.idNguoiDung;
  const trangThai = req.query.trangThai;

  try {
    // Truy vấn cơ sở dữ liệu chính xác
    const themBanBe = await NguoiDung.findOne({ idNguoiDung: idNguoiDung, trangThai: 0 });

    if (themBanBe) {
      // Thực hiện thao tác xóa ở đây

      res.json({
        data: {
          idTheoDoi: idTheoDoi,
          idNguoiDung: idNguoiDung,
          trangThai: 0,
        },
        message: "Xóa thành công",
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng phù hợp." });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
});

router.get('/getdanhSachNguoiDung', async function (req, res) {
  const hoTen = req.query.get('hoTen');
  const hinhAnh = req.query.get('hinhAnh');
  const danhSachNguoiDung = await NguoiDung.find({ });

});

module.exports = router;
