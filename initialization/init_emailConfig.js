require('dotenv').config();

const mongoDB = require('../modules/database');
const EmailSMTP = require('../models/emailSMTPModel');

async function init() {
    mongoDB.connectDB();
    const data = {
        host: 'localhost',
        port: 465,
        user: 'test',
        pass: '123456',
        from: 'noreply@gmail.com',
        to: [],
        default: true,
    };
    await EmailSMTP.create(data);
    console.log("Init complete");
}

init();