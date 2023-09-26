const express = require('express');
var mongo = require('mongoose');
const MONGODB_URL = 'mongodb+srv://phucnxph29170:Kondien123@cluster0.kutdlfc.mongodb.net';
const DB_NAME = 'film'

const MongodbHelper = async () => {
    await mongo.connect(MONGODB_URL + "/" + DB_NAME);
}

module.exports = MongodbHelper;