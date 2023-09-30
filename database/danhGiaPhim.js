var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var danhGiaPhim = new Schema({
    tenPhim: String,
    yeuThich: String,
    danhGia: String,
    trangThaiXem: Number,
    trangThai: Number,
    hinhAnh: [{type:String}]
});

module.exports = mongoose.model('NguoiDung', danhGiaPhim , 'profile');
