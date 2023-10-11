const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");

//Api hiển thị tất cả bài đăng của bạn bè
const getBaiDangBanBe = async function (req,res){
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    var data = await BanBe.aggregate([
        {$match: {
            idNguoiDung: idNguoiDung,
            trangThai: 1
        }},
        {$lookup: {
            from: "BaiDang",
            localField: "idTheoDoi",
            foreignField: "idNguoiDung",
            as: "KetQuaBaiDang"
        }},
        {$unwind: {
          path: "$KetQuaBaiDang",
          preserveNullAndEmptyArrays: false
        }},
        {$lookup: {
            from: "NguoiDung",
            localField: "idTheoDoi",
            foreignField: "_id",
            as: "KetQuaBanBe"
        }},
        {$unwind: {
          path: "$KetQuaBanBe",
          preserveNullAndEmptyArrays: false
        }},
        {$lookup: {
            from: "DanhGiaPhim",
            localField: "KetQuaBaiDang.idDanhGiaPhim",
            foreignField: "_id",
            as: "KetQuaDanhGiaPhim"
        }},
        {$unwind: {
            path: "$KetQuaDanhGiaPhim",
            preserveNullAndEmptyArrays: false
        }},
        { $sort : 
          { "KetQuaBaiDang.ngayTao" : -1 } 
        },
        {$project : {
          "idBaiDang": "$_id", 
          "chuDe" : "$KetQuaBaiDang.chuDe",
          "noiDung" : "$KetQuaBaiDang.noiDung",
          "ngayTao" : { $dateToString: { format: "%d-%m-%Y" , date: "$KetQuaBaiDang.ngayTao"} },
          "hoTenBanBe" : "$KetQuaBanBe.hoTen",
          "hinhAnhBanBe" : "$KetQuaBanBe.hinhAnh",
          "idPhim" : "$KetQuaDanhGiaPhim.idPhim",
          "yeuThich" : "$KetQuaDanhGiaPhim.yeuThich",
          "danhGia" : "$KetQuaDanhGiaPhim.danhGia",
          "trangThaiXem" : "$KetQuaDanhGiaPhim.trangThaiXem",
          "hinhAnhPhim" : "$KetQuaDanhGiaPhim.hinhAnh"
        }}
    ]);

    res.json({
        data,
        message:'Thành công'
    });
}

//Api hiển thị tất cả bài đăng cá nhân
const getBaiDangCaNhan = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    var data = await baiDang.aggregate([
      {$match: {
          idNguoiDung: idNguoiDung,
          trangThai: 1
      }},
      {$lookup: {
        from: "DanhGiaPhim",
        localField: "idDanhGiaPhim",
        foreignField: "_id",
        as: "KetQuaDanhGiaPhim"
      }},
      {$unwind: {
          path: "$KetQuaDanhGiaPhim",
          preserveNullAndEmptyArrays: false
      }},
      {$lookup: {
        from: "NguoiDung",
        localField: "idNguoiDung",
        foreignField: "_id",
        as: "KetQuaNguoiDung"
      }},
      {$unwind: {
        path: "$KetQuaNguoiDung",
        preserveNullAndEmptyArrays: false
      }},
      { $sort : 
        { "ngayTao" : -1 } 
      },
      {$project : {
        "idBaiDang": "$_id", 
        "chuDe" : "$chuDe",
        "noiDung" : "$noiDung",
        "ngayTao" : { $dateToString: { format: "%d-%m-%Y" , date: "$ngayTao"} },
        "hoTen" : "$KetQuaNguoiDung.hoTen",
        "hinhAnh" : "$KetQuaBanBe.hinhAnh",
        "idPhim" : "$KetQuaDanhGiaPhim.idPhim",
        "yeuThich" : "$KetQuaDanhGiaPhim.yeuThich",
        "danhGia" : "$KetQuaDanhGiaPhim.danhGia",
        "trangThaiXem" : "$KetQuaDanhGiaPhim.trangThaiXem",
        "hinhAnhPhim" : "$KetQuaDanhGiaPhim.hinhAnh"
      }}
    ]);
    res.end(JSON.stringify({
        data,
        message:'Thành công'
    }));
}

module.exports = {
    getBaiDangBanBe,
    getBaiDangCaNhan
}