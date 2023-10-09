var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var baiDang = new Schema({
    idPhim: String,
    idNguoiDung: String,
    tenPhim: String,
    chuDe:String,
    noiDung:String,
    ngayTao:String,
    hinhAnh: [{type:String}],/*link hinh anh*/
    trangThai:Number
});

module.exports = mongoose.model('BaiDang', baiDang , 'BaiDang');
