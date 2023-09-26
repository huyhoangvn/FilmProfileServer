var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nguoiDungSchema = new Schema({
    taiKhoan: String,
    matKhau: String,
    hoTen: String,
    ngaySinh:String,
    gioiTinh:String,
    moTa:String,
    hinhAnh: [{type:String}]
});

module.exports = mongoose.model('NguoiDung', nguoiDungSchema , 'profile');  