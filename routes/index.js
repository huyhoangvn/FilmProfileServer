var express = require('express');
var router = express.Router();
const {} = require("express");
var mongo = require('mongoose');
const {log} = require("debug");
const {route} = require("express/lib/router");
main().catch(err => console.log(err));

/* GET home page. */
//Ket noi mongoose
async function main(){
    await mongo.connect('mongodb+srv://phucnxph29170:Kondien123@cluster0.kutdlfc.mongodb.net/film')
}
//Khoi tao account
const account = new mongo.Schema({
  ten: String,
  gmail: String,
  matKhau: String,
  nhapLai:String
});

//Them account
/*router.post('/themTaiKhoan',async function (req, res) {
      const ten = req.body.ten;
      const gmail = req.body.gmail;
      const matKhau = req.body.matKhau;
      const nhapLai = req.body.nhapLai;
      const ACCOUNT = mongo.model('TaiKhoan', account, 'profile');
      const data = await ACCOUNT.find({});
        await ACCOUNT.create({
            ten: ten,
            gmail: gmail,
            matKhau: matKhau,
            nhapLai: nhapLai,
        })
      res.render('index', { data: data, messsage:'Them thanh cong!!!'})
    });*/
router.post('/themTaiKhoan', async function (req, res) {
    const ten = req.body.ten
    const gmail = req.body.gmail
    const matKhau = req.body.matKhau
    const nhapLai = req.body.nhapLai
    console.log( req)
    const ACCOUNT = mongo.model('TaiKhoan', account, 'profile')
    const data = await ACCOUNT.find();
    await ACCOUNT.create({
        ten:ten,
        gmail:gmail,
        matKhau:matKhau,
        nhapLai:nhapLai
    })
    res.render('index', {data: data, message:'Them thanh cong'})
})

router.get('/', async function (req, res, next) {
  const ACCOUNT = mongo.model('TaiKhoan', account, 'profile');
  const data = await ACCOUNT.find({});
  res.render('index', {title: 'Express', data:data});
});

module.exports = router;
