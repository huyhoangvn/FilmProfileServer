var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var danhGiaPhim = new Schema({
    idNguoiDung: String,
    idPhim: String,
    tenPhim: String,
    yeuThich: Number,
    danhGia: Number,
    trangThaiXem: Number,
    trangThai: Number,
    hinhAnh: [{type:String}]
});

module.exports = mongoose.model('danhGiaPhim', danhGiaPhim , 'film');
