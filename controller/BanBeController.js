const mongo = require('mongoose');
const NguoiDung = require('../database/NguoiDung');
const danhGiaPhim = require('../database/DanhGiaPhim');
const baiDang = require('../database/BaiDang');
const BanBe = require("../database/BanBe");
const Thich = require("../database/Thich");

const ThemBanBe = async function (req, res) {
    try {
        const idTheoDoi = new mongo.Types.ObjectId(req.params.idTheoDoi);
        const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
        
       
      
        const existingUser = await BanBe.findOne({
            idTheoDoi: idTheoDoi,
            idNguoiDung: idNguoiDung,   
        });
         
        if (existingUser) {
          if(existingUser.trangThai == 1){
            return res.end(JSON.stringify({ data: {}, message: "Tài khoản đã tồn tại" }));
          }
          else if(existingUser.trangThai == 0){
            const update = {trangThai:1}
            var data = await BanBe.findOneAndUpdate(existingUser,update);
            res.end(
              JSON.stringify({
              data,
               message: "Sửa thành công",
              }));
          }
        } else {
          const newFriend = await BanBe.create({
            idTheoDoi: idTheoDoi,
            idNguoiDung: idNguoiDung,
            trangThai: 1,
          });
    
          const result = {
              data: {
                  idTheoDoi: newFriend.idTheoDoi,
                  idNguoiDung: newFriend.idNguoiDung,
                  trangThai: newFriend.trangThai,
              },
              message: "Kết bạn thành công",
          };
    
          return res.end(JSON.stringify(result));
        }
    
        
    } catch (error) {
        return res.status(500).end(JSON.stringify({ message: "Đã xảy ra lỗi không mong muốn" }));
    }
}

const XoaBanBe = async (req,res) => {
    const idTheoDoi = new mongo.Types.ObjectId(req.params.idTheoDoi);
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);


    try {
        const update = {trang:0}
        const fifter = { idNguoiDung: idNguoiDung,idTheoDoi:idTheoDoi, trangThai: 1 }
        // Truy vấn cơ sở dữ liệu chính xác
        const themBanBe = await BanBe.findOne(fifter,update,{new:true});
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
}

const GetDanhSachTimNguoiDung = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const timKiemTen = req.query.timKiemTen;
    const trang = req.query.trang;
    var data = await NguoiDung.aggregate([
        {$match: {
                _id: {$not: {$eq: idNguoiDung}},
                hoTen: {$regex: timKiemTen},
                trangThai: 1
            }},
        {
            $skip: (trang-1)*10,
        },
        {
            $limit: 10,
        },
        {$lookup: {
            from: "BanBe",
            localField: "_id",
            foreignField: "idTheoDoi",
            pipeline: [
                { $match: { "idNguoiDung": idNguoiDung } }
            ],
            as: "KetQuaBanBe"
        }},
        {   
            $addFields: 
            {
                trangThaiKetBan: 
                    {
                        $cond: {if: {"$eq": [{ $size:"$KetQuaBanBe" }, 0]}, 
                        then: false, 
                        else: true }
                    }
            }  
        }, 
        {
            $project : {
                "hoTen" : "$hoTen",
                "ngaySinh": "$ngaySinh",
                "moTa": "$moTa",
                "hinhAnh" : { $concat:[req.protocol + "://", req.get("host"), "/public/images/", { $arrayElemAt: ["$hinhAnh", 0]}]},
                "trangThaiKetBan": "$trangThaiKetBan"
            }
        }
    ]);
    res.end(JSON.stringify({
        data,
        message:'Thành công'
    }));
}

const IsTheoDoi = async function (req, res) {
    const idNguoiDungHienTai = new mongo.Types.ObjectId(req.params.idNguoiDungHienTai);
    const idNguoiDungBatKy = new mongo.Types.ObjectId(req.params.idNguoiDungBatKy);
    var ketQua = await BanBe.aggregate([
        {$match: {
                idNguoiDung: idNguoiDungHienTai,
                idTheoDoi: idNguoiDungBatKy,
                trangThai: 1
            }},
    ]);
    data = (ketQua.length > 0)?true:false;
    res.end(JSON.stringify({
        data,
        message:'Thành công'
    }));
}

const GetDanhSachBanBe = async function (req, res) {
    const idNguoiDung = new mongo.Types.ObjectId(req.params.idNguoiDung);
    const trang = req.query.trang;
    var data = await BanBe.aggregate([
        {$match: {
                idNguoiDung: {$eq: idNguoiDung},
                trangThai: 1
            }},
        {
            $skip: (trang-1)*10,
        },
        {
            $limit: 10,
        },
        {$lookup: {
            from: "NguoiDung",
            localField: "idTheoDoi",
            foreignField: "_id",
            as: "KetQuaThongTinBanBe"
        }},
        {
            $unwind: {
                path: "$KetQuaThongTinBanBe",
                preserveNullAndEmptyArrays: false
            }
        },
        {
            $project : {
                "_id" : "$idTheoDoi",
                "hoTen" : "$KetQuaThongTinBanBe.hoTen",
                "ngaySinh": "$KetQuaThongTinBanBe.ngaySinh",
                "moTa": "$KetQuaThongTinBanBe.moTa",
                "hinhAnh" : { $concat:[req.protocol + "://", req.get("host"), "/public/images/", { $arrayElemAt: ["$KetQuaThongTinBanBe.hinhAnh", 0]}]},
            }
        },
        {
            $addFields: {
                trangThaiKetBan: 1
            }
        }
    ]);
    res.end(JSON.stringify({
        data,
        message:'Thành công'
    }));
}


module.exports = {
    ThemBanBe,
    XoaBanBe,
    GetDanhSachTimNguoiDung,
    GetDanhSachBanBe,
    IsTheoDoi
}
