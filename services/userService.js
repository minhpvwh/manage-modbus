const BaseService = require('./baseService');
const User = require('../models/userModel');
const Company = require('../models/companyModel');
const bcrypt = require('bcryptjs');
const constants = require('../utils/constants');
const config = require('../configs');
const fileUtils = require('../utils/fileUtils');
const Language = require('../models/languageModel');
const Utils = require('../utils/utils');
const mailer = require('../modules/mailer');
const moment = require('moment');

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    async remove(query, req) {
        if (query._id === req.user.company.root.toString()) {
            throw {
                ...constants.errors.ACCESS_DENY,
                message: 'deleteUserRoot.deny',
                desc: 'can not delete user root of the company'
            }
        }
        if (query._id === req.user._id.toString()) {
            throw {...constants.errors.ACCESS_DENY, message: 'deleteMyUser.deny', desc: 'can not delete user logging'}
        }
        const rs = await this.model.findOneAndRemove(query);
        if (!rs) {
            throw {...constants.errors.NOT_FIND_OBJECT, desc: 'Cannot remove'};
        }
        return rs;
    }

    async getAll({query = {}, fields = "", page = 0, size = 20, sorts = undefined, populate = []} = {}, req) {
        const options = {sort: {'_id': -1}};
        if (sorts && typeof (sorts) === 'object') {
            options['sort'] = sorts;
        }
        const rs = Utils.normalizeParams(query, fields, page, size, options);
        if (Object.keys(rs.query).length !== 0) {
            const fieldSchema = await this.getFieldSchema(rs.query);
            let querySeach = {};
            if ("search" in rs.query) {
                const fieldSchemaCustom = ["email", "name"];
                querySeach = {
                    $or: [
                        ...fieldSchemaCustom.map(field => ({
                            [field]: new RegExp(rs.query.search.trim(), 'i')
                        }))
                    ]
                };
                delete rs.query["search"];
            }
            if ("language" in rs.query) {
                const language = await Language.distinct("_id", {code: {$in: rs.query.language.split(",")}});
                if (language) {
                    rs.query = {...rs.query, lang: {$in: language}};
                    delete rs.query["language"];
                }
            }
            let queryFinds = [];
            for (const i in fieldSchema.data) {
                queryFinds.push([i, {$regex: `${rs.query[i].trim()}`, $options: 'i'}])
            }
            queryFinds = new Map(queryFinds);
            queryFinds = Object.fromEntries(queryFinds);
            rs.query = {...rs.query, ...querySeach, ...queryFinds};
        }
        const data = await this.model.find(rs.query, rs.fields + ' -tokens -company', options).populate(populate);
        const count = await this.model.count(rs.query);
        const numberPage = size > 0 ? Math.ceil((count / size)) : 0;
        const meta = {count, size, totalPage: numberPage, page};
        return {meta, data};
    }

    async create(data) {
        if (data.password.trim().length < 8) {
            throw {
                ...constants.errors.PARAM_INVALID,
                message: 'password.invalid',
                desc: 'password invalid min length',
            }
        }
        const avatar = data.avatar;
        delete data.avatar;
        if (avatar) {
            try {
                const {path} = await fileUtils.saveImage(avatar, false, `users/${data.company._id.toString()}`);
                data.avatarPath = path;
                data.avatar = path.replace(config.storeConfig.IMAGE_FOLDER, config.storeConfig.IMAGE_URL);
            } catch (error) {
                throw {
                    ...constants.errors.IMAGE_WRONG,
                    message: 'avatar.wrong',
                    desc: "save avatar error"
                };
            }
        }

        return super.create(data);
    }

    async update(query, object) {
        if (object.email) {
            const checkRootUserCompany = await Company.findOne({root: query._id});
            if (checkRootUserCompany) {
                const checkOldValueEmail = await User.findOne({_id: query._id});
                if (checkOldValueEmail && checkOldValueEmail.email !== object.email.trim()) {
                    throw {
                        ...constants.errors.DENY_CHANGE,
                        message: 'changeEmailAdmin.deny',
                        desc: 'Admin can not change email'
                    }
                }
            }
        }
        for (const att of this.model.getIgnoreUpdateAttr() || []) {
            delete object[att];
        }
        if (object.password) {
            object.password = await bcrypt.hash(object.password, 8);
        }
        if (object.avatar) {
            try {
                const {path} = await fileUtils.saveImage(object.avatar, false, `users/${object.company._id.toString()}`);
                object.avatarPath = path;
                object.avatar = path.replace(config.storeConfig.IMAGE_FOLDER, config.storeConfig.IMAGE_URL);
            } catch (error) {
                throw {
                    ...constants.errors.IMAGE_WRONG,
                    message: 'avatar.wrong',
                    desc: "save avatar error"
                };
            }
        }
        const rs = await this.model.findOneAndUpdate(query, object, {new: true});
        if (!rs) {
            throw {...constants.errors.NOT_FIND_OBJECT, desc: 'Cannot update'};
        }
        return rs;
    }

    async login(email, password) {
        const user = await User.findByCredentials(email, password);
        if (!user) {
            throw {
                ...constants.authenErrors.NOT_FIND_OBJECT,
                message: 'user.not_found',
                desc: `Cannot find email = ${email}`
            };
        } else {
            if (user.company.status === 'pause') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'pauseCompany.not_active',
                    desc: 'the company at status : Pause'
                }
            } else if (user.company.status === 'cancel') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'cancelCompany.not_active',
                    desc: 'the company at status: Cancel'
                }
            }
            if (user.company.expiredDate && moment(user.company.expiredDate).isBefore(Date.now())) {
                throw {...constants.authenErrors.SERVICE_EXPIRED}
            }
        }
        const token = await user.generateAuthToken();
        return {token, lang: user.lang, name: user.name, _id: user._id, avatar: user.avatar};
    }

    async forgotPassword(email) {
        const user = await User.findOne({email}).populate('lang company');
        if (!user) {
            throw {
                ...constants.errors.NOT_FIND_OBJECT,
                message: 'email.not_found',
                desc: `Cannot find email = ${email}`
            };
        } else {
            if (user.company.status === 'pause') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'pauseCompany.not_active',
                    desc: 'the company at status : Pause'
                }
            } else if (user.company.status === 'cancel') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'cancelCompany.not_active',
                    desc: 'the company at status: Cancel'
                }
            }
            if (user.company.expiredDate && moment(user.company.expiredDate).isBefore(Date.now())) {
                throw {...constants.errors.SERVICE_EXPIRED}
            }
        }

        const token = await user.generateAuthTokenResetPassword();
        const content = `Access this link to reset password: ${config.serverConfig.CURRENT_URL}/reset-password?auth=${token}`;
        await mailer.send(
            config.smtpConfig.EMAIL_SENDER,
            email,
            'Reset password',
            content
        );
        return {}
    }

    async resetPassword(token, password) {
        const user = await User.findOne({resetToken: token});
        if (!user) {
            throw {
                ...constants.errors.NOT_FIND_OBJECT,
                message: 'token.not_found',
                desc: `Token false`
            };
        } else {
            if (user.company.status === 'pause') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'pauseCompany.not_active',
                    desc: 'the company at status : Pause'
                }
            } else if (user.company.status === 'cancel') {
                throw {
                    ...constants.errors.COMPANY_NOT_ACTIVE,
                    message: 'cancelCompany.not_active',
                    desc: 'the company at status: Cancel'
                }
            }
            if (user.company.expiredDate && moment(user.company.expiredDate).isBefore(Date.now())) {
                throw {...constants.errors.SERVICE_EXPIRED}
            }
        }
        const lifeTimeToken = token.split('-').shift();
        if (lifeTimeToken < new Date().getTime()) {
            throw {
                ...constants.errors.OBJECT_EXPIRED,
                message: 'tokenResetPassword.expired',
                desc: `token reset password expired`
            };
        }
        await user.update({
            password: await bcrypt.hash(password, 8),
            lastChangePw: new Date(),
            resetToken: '',
            $pullAll: {tokens: user.tokens}
        });
        return {};
    }

    async logout(id, token) {
        const user = await User.findById(id);
        if (!user) {
            return;
        }
        for (const t of user.tokens) {
            if (t.token === token) {
                const pullAll = {$pullAll: {tokens: [t]}};
                await User.findOneAndUpdate({_id: id}, pullAll);
            }
        }
    }

    async logoutAll(id, token) {
        const user = await User.findById(id);
        if (!user) {
            return;
        }
        const pullAll = {$pullAll: {tokens: user.tokens}};
        await User.findOneAndUpdate({_id: id}, pullAll);
    }

    async changePassword(_id, currentPassword, newPassword) {
        const user = await User.findById(_id);
        if (!user) {
            throw {
                ...constants.errors.NOT_FIND_OBJECT,
                message: 'user.not_found',
                desc: 'user does not exist',
            }
        }
        const checkCurrentpass = await bcrypt.compare(currentPassword, user.password);
        if (!checkCurrentpass) {
            throw {
                ...constants.errors.PARAM_INVALID,
                message: 'password.wrong',
                desc: 'current password do not match',
            }
        }

        const checkNewpass = await bcrypt.compare(newPassword, user.password);
        if (checkNewpass) {
            throw {
                ...constants.errors.PARAM_INVALID,
                message: 'newPasswordSameAsOldPassword.invalid',
                desc: 'the new password same as old password',
            }
        }
        await User.findOneAndUpdate({_id: _id}, {
            password: await bcrypt.hash(newPassword, 8),
            lastChangePw: new Date()
        }, {new: true});
    }
}

module.exports = new UserService();