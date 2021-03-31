const contants = require('../utils/constants');
const responseUtils = require('../utils/responseUtils');
const authUtils = require('./authUtils');
const moment = require('moment');

async function authUser(req, res, next) {
    try {
        const {user, token} = await authUtils.checkWebClient(req.header('Authorization'));
        req.user = user;
        req.token = token;

        if (!user.company) {
            throw {...contants.authenErrors.USER_NOT_IN_COMPANY}
        } else {
            if (user.company.expiredDate && moment(user.company.expiredDate).isBefore(Date.now())) {
                throw {...contants.authenErrors.SERVICE_EXPIRED}
            }
        }
        if (user.company.status === 'pause') {
            throw {...contants.authenErrors.USER_PAUSE_COMPANY, desc: 'the company at status : Pause'}
        } else if (user.company.status === 'cancel') {
            throw {...contants.authenErrors.USER_CANCEL_COMPANY, desc: 'the company at status: Cancel'}
        }

        checkPermission(req, user);
        next();
    } catch (error) {
        console.error('error at authWithToken', error);
        return res.send(responseUtils.toErrorResponse(error));
    }
}

function checkPermission(req, user) {
    req.query = {...req.query, company: user.company._id || user.company};
    req.body.company = user.company;
}

module.exports = authUser;
