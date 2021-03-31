const config = require('../configs');
const mongoose = require('mongoose');
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

/* setting for connect ssl */
// const fs = require('fs');
// const ca = fs.readFileSync(`${__dirname}/rds-combined-ca-bundle.pem`);
// options.sslValidate = true;
// options.sslCA = ca;
// options.ssl = true;

function connectDB(canConnectWhenError = true) {
    mongoose.connect(config.mongoDBConfig.MONGO_URI, options)
        .then(() => {
            console.log(`Connected database successfully: ${config.mongoDBConfig.MONGO_URI}`);
            mongoose.connection.on('disconnected', function (e) {
                setTimeout(function () {
                    console.log('reconnect with mongodb');
                    connectDB(false);
                }, 2000);
            });

        }, err => {
            console.log(`Error while connecting to database\n${err}`);
            if (canConnectWhenError) {
                setTimeout(function () {
                    connectDB(true);
                }, 2000);
            }
        });
}

module.exports = {
    connectDB,
};
