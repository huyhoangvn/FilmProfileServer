var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banBe = new Schema({
    idNguoiDung: String,
    idTheoDoi: String,
    trangThai: Number
});

module.exports = mongoose.model('BanBe', banBe , 'BanBe');
