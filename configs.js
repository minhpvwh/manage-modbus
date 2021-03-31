const serverConfig = {
    JWT_KEY: process.env.JWT_KEY || 'base-nodejs',
    JWT_TOKEN_LIFETIME: process.env.JWT_TOKEN_LIFETIME || '30d',
    CURRENT_URL: process.env.CURRENT_URL || 'http://ex.minh.pv',
};

const mongoDBConfig = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/pmsa',
};

const storeConfig = {
    UPLOAD_FOLDER: __dirname + '/public/uploads/',
    IMAGE_FOLDER: __dirname + '/public/api/v1/images',
    IMAGE_URL: serverConfig.CURRENT_URL + '/api/v1/images'
};

const apiVersion = {
    v1: '/api/v1',
};

const smtpConfig = {
    EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST || 'email-smtp.us-west-2.amazonaws.com',
    EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT || 465,
    EMAIL_SMTP_USERNAME: process.env.EMAIL_SMTP_USERNAME || 'AKIA3UYV6PM6KCGUQ4XB',
    EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD || 'BFFK4MmiFjGE5Rg5Ppd/HvU0kbYeim3qhdRGwKXJfkSD',
    EMAIL_SMTP_SECURE: process.env.EMAIL_SMTP_SECURE || true,
    EMAIL_SENDER: process.env.EMAIL_SENDER || 'noreply@fabbi.com.vn'
};

const mySqlConfig = {
    MYSQL_HOST: process.env.MYSQL_HOST || 'tuvnordvietnam.vn',
    MYSQL_PORT: process.env.MYSQL_PORT || 33306,
    MYSQL_DATABASE_NAME: process.env.MYSQL_DATABASE_NAME || 'pmsa_dev',
    MYSQL_USERNAME: process.env.MYSQL_USERNAME || 'pmsa_dev',
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || 'MFa74ysYxCnFSnt5',
};

module.exports = {
    serverConfig,
    mongoDBConfig,
    storeConfig,
    apiVersion,
    smtpConfig,
    mySqlConfig,
};