var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema = mongoose.Schema;

var danhGiaPhim = new Schema({
    idNguoiDung: {type: mongoose.Schema.Types.ObjectId, ref:'NguoiDung'},
    idPhim: String,
    tenPhim: String,
    yeuThich: Number,
    danhGia: Number,
    trangThaiXem: Number,
    trangThai: Number,
    hinhAnh: [{type:String}]
});

module.exports = mongoose.model('danhGiaPhim', danhGiaPhim , 'DanhGiaPhim');
