var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nguoiDungSchema = new Schema({
    taiKhoan: String,
    matKhau: String,
    hoTen: String,
    ngaySinh:String,
    gioiTinh:Number,
    moTa:String,
    hinhAnh: [{type:String}],
    trangThai:Number
});

module.exports = mongoose.model('NguoiDung', nguoiDungSchema , 'profile');
