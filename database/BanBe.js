var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banBe = new Schema({
    idNguoiDung: String,
    idDuocTheoDoi: String,
    trangThai: Number
});

module.exports = mongoose.model('BanBe', banBe , 'BanBe');
