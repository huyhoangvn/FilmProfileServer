var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Thich = new Schema({
    idNguoiDung: String,
    idBaiDang: String,
    trangThai: Number
});

module.exports = mongoose.model('Thich', Thich , 'Thich');
