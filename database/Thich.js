var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema = mongoose.Schema;

var Thich = new Schema({
    idNguoiDung:  {type: mongoose.Schema.Types.ObjectId, ref:'idNguoiDung'},
    idBaiDang: String,
    trangThai: Number
});

module.exports = mongoose.model('Thich', Thich , 'Thich');
