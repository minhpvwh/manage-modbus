const Company = require('../models/companyModel');
// const Device = require('../models/device');
const utils = require('../utils/utils');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const {serverConfig} = require('../configs');
const constants = require('../utils/constants');

// async function checkDevice(clientId, sign, timestamp) {
//     const device = await Device.findOne({clientId}).populate('company');
//     if (!device) {
//         throw {...constants.errors.NOT_FIND_OBJECT, message: 'device.not_found'};
//     }
//     const mySign = utils.MD5(`${device.clientId}#${device.secretKey}#${timestamp}`);
//     if (mySign !== sign) {
//         throw {...constants.errors.PARAM_INVALID, message: 'sign.not_match'};
//     }
//     return device;
// }

async function checkCompany(clientId, sign, timestamp) {
    const company = await Company.findOne({clientId});
    if (!company) {
        throw {...constants.errors.NOT_FIND_OBJECT, message: 'company.not_found'};
    }
    const mySign = utils.MD5(`${company.clientId}#${company.secretKey}#${timestamp}`);
    if (mySign !== sign) {
        throw {...constants.errors.PARAM_INVALID, message: 'sign.not_match'};
    }
    return company;
}

async function checkWebClient(authorization) {
    if (!authorization) {
        throw ({
            ...constants.authenErrors.PARAM_REQUIRED,
            message: 'authorization.missing',
        });
    }
    const token = authorization.replace('Bearer ', '');
    if (!token) {
        throw ({
            ...constants.authenErrors.PARAM_INVALID,
            message: 'token.invalid',
            desc: `The param toke = ${token} is invalid`,
        });
    }
    let data;
    try {
        data = jwt.verify(token, serverConfig.JWT_KEY);
    } catch (error) {
        console.log("Error at jwt verify", error);
        throw ({
            ...constants.authenErrors.PARAM_INVALID,
            message: 'token.invalid',
            desc: `The param token = ${token} is invalid`,
        });
    }

    const user = await User.findOne({_id: data._id, 'tokens.token': token}, '-password -tokens')
        .populate(['company', 'lang']);
    if (!user) {
        throw ({
            ...constants.authenErrors.NOT_FIND_OBJECT,
            message: 'user.not_found',
            desc: `cannot find user id = ${data._id} and token = ${token}`,
        });
    }
    return {user, token};
}

module.exports = {
    // checkDevice,
    checkWebClient,
    checkCompany,
};
