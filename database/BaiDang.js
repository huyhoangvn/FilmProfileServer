var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema = mongoose.Schema;

var baiDang = new Schema({
    idDanhGiaPhim: String,
    idNguoiDung: String,
    chuDe:String,
    noiDung:String,
    ngayTao:String,
    trangThai:Number
});

module.exports = mongoose.model('BaiDang', baiDang , 'BaiDang');
