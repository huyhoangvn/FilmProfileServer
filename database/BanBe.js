var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banBe = new Schema({
    idNguoiDung: {type: mongoose.Schema.Types.ObjectId, ref:'idNguoiDung'},
    idTheoDoi: String,
    trangThai: Number
});

module.exports = mongoose.model('BanBe', banBe , 'BanBe');
