var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema = mongoose.Schema;

var baiDang = new Schema({
    idDanhGiaPhim: {type: mongoose.Schema.Types.ObjectId, ref:'DanhGiaPhim'},
    idNguoiDung: {type: mongoose.Schema.Types.ObjectId, ref:'NguoiDung'},
    chuDe:String,
    noiDung:String,
    ngayTao:Date,
    trangThai:Number
});

module.exports = mongoose.model('BaiDang', baiDang , 'BaiDang');
