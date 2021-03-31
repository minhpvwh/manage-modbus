require('dotenv').config();

const mongoDB = require('../modules/database');
const Company = require('../models/companyModel');
const User = require('../models/userModel');
const Language = require('../models/languageModel');
async function init() {
    mongoDB.connectDB();
    const languages = [{ name: 'Tiếng Việt', code: 'vi' }, { name: 'English', code: 'en' }, { name: '日本語', code: 'ja' }];
    for (const lang of languages) {
        const lg = await Language.create(lang);
        lang._id = lg._id;
    }
    const company = await Company.create({
        name: 'ExCompany',
    });
    const user = await User.create({
        company,
        lang: languages[1]._id,
        name: 'Admin',
        email: 'admin@ex.com',
        password: '123456789',
        timeZone: 7,
        type: 'admin'
    });
    await Company.update({ _id: company._id }, {
        root: user,
    });
    console.log("Init complete");
}

init();
