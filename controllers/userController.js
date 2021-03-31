const BaseController = require('./baseController');
const userService = require('../services/userService');
const responseUtils = require('../utils/responseUtils');
const {messageResponse, errors} = require('../utils/constants');
const validator = require('validator');
const Utils = require('../utils/utils');

class UserController extends BaseController {
    constructor() {
        super(userService);
    }

    async get(req, res, message = messageResponse.GET_SUCCESS) {
        try {
            const query = {_id: req.params['id']};
            const populate = [
                {path: 'lang', select: ''},
            ];
            const rs = await this.service.get(query, populate);
            return res.send(responseUtils.toResponse(rs, message));
        } catch (error) {
            console.log('Get one', error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async getAll(req, res, message = messageResponse.GET_ALL_SUCCESS) {
        try {
            const {query, fields, page, size, sorts} = await Utils.exportParams(req);
            const populate = [
                {path: 'lang', select: ''},
            ];
            const rs = await userService.getAll({query, fields, page, size, sorts, populate}, req);
            return res.send(responseUtils.toResponse(rs, message));
        } catch (error) {
            console.log('GetAll', error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async login(req, res) {
        const {email, password} = req.body;
        try {
            const {token, lang, name, _id, avatar } = await userService.login(email.trim(), password);
            return res.send(responseUtils.toResponse({token, lang, name, _id, avatar}, messageResponse.LOGIN_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async forgotPassword(req, res) {
        const {email} = req.body;
        try {
            const rs = await userService.forgotPassword(email.trim());
            return res.send(responseUtils.toResponse(rs, messageResponse.SEND_MAIL_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async resetPassword(req, res) {
        const {token, password} = req.body;
        try {
            if(Utils.isEmpty(token)){
                throw {
                    ...errors.PARAM_EMPTY,
                    message: 'tokenResetPassword.empty',
                    desc: 'token reset password miss',
                }
            }
            if(password.length < 8){
                throw {
                    ...errors.PARAM_INVALID,
                    message: 'newPassword.invalid',
                    desc: 'new password invalid min length',
                }
            }
            const rs = await userService.resetPassword(token, password);
            return res.send(responseUtils.toResponse(rs, messageResponse.CHANGE_PASSWORD_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async logout(req, res) {
        try {
            await userService.logout(req.user._id, req.token);
            return res.send(responseUtils.toResponse({}, messageResponse.LOGOUT_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async logoutAll(req, res) {
        try {
            await userService.logoutAll(req.user._id, req.token);
            return res.send(responseUtils.toResponse({}, messageResponse.LOGOUT_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async changePassword(req, res) {
        try {
            const userData = req.body;
            const {_id, currentPassword, newPassword, newPasswordConfirm} = userData;
            if (newPassword.trim().length < 8) {
                throw {
                    ...errors.PARAM_INVALID,
                    message: 'newPassword.invalid',
                    desc: 'new password invalid min length',
                }
            }
            if (newPassword.trim() !== newPasswordConfirm.trim()) {
                throw {
                    ...errors.NOT_MATCH,
                    message: 'newPasswordConfirm.invalid',
                    desc: 'password confirm do not match',
                }
            }

            await userService.changePassword(_id, currentPassword, newPassword);

            return res.send(responseUtils.toResponse({}, messageResponse.CHANGE_PASSWORD_SUCCESS));
        } catch (error) {
            console.error(error);
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async update(req, res, message = messageResponse.UPDATE_SUCCESS) {
        try {
            if (!req.user.type || !['admin'].includes(req.user.type)){
                if (req.params['id'] !== req.user._id.toString()){
                    throw {...errors.ACCESS_DENY, message: 'updateUserAccess.deny', desc: 'user not access to update diff user'}
                }
            }
            if (req.body.email) {
                if (!validator.isEmail(req.body.email.trim())) {
                    throw {
                        ...errors.PARAM_INVALID,
                        message: 'email.invalid'
                    }
                }
            }
            if (req.body.password) {
                if (req.body.password.trim().length < 8) {
                    throw {
                        ...errors.PARAM_INVALID,
                        message: 'password.invalid',
                        desc: 'new password invalid min length',
                    }
                }
            }
            const query = {_id: req.params['id']};
            const rs = await userService.update(query, req.body);
            return res.send(responseUtils.toResponse(rs, message));
        } catch (error) {
            return res.send(responseUtils.toErrorResponse(error));
        }
    }

    async remove(req, res, message = messageResponse.DELETE_SUCCESS) {
        try {
            const query = { _id: req.params['id'] };
            const rs = await this.service.remove(query, req);
            return res.send(responseUtils.toResponse(rs, message));
        } catch (error) {
            console.log('Remove', error);
            return res.send(responseUtils.toErrorResponse(error, message));
        }

    }
}

module.exports = new UserController();