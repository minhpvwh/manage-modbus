const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const constant = require('../utils/constants');
const validator = require('validator');
const config = require('../configs');
const ObjectId = mongoose.Types.ObjectId;
const {generate_secret_key} = require('../utils/utils');

const userSchema = new mongoose.Schema({
    _id: {type: ObjectId, auto: true},
    company: {type: ObjectId, ref: 'Company', required: true},
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    password: {type: String, required: [true, 'Password is required']},
    email: {
        type: String, required: [true, 'Email is required'], index: true, lowercase: true, unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw {message: 'Invalid Email address'}
            }
        }
    },
    avatar: {type: String},
    avatarPath: {type: String},
    tokens: [{_id: {type: ObjectId, auto: true}, token: {type: String, required: true}}],
    lang: {type: ObjectId, ref: 'Language', required: [true, 'Language is required']},
    lastChangePw: {type: Date},
    type: {type: String, enum: ['employee', 'admin'], default: 'employee', lowercase: true},
    resetToken: {type: String},
}, {
    timestamps: true,
    _id: false,
});
userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
        user.tokens = [];
    }
    next();
});

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({_id: user._id}, config.serverConfig.JWT_KEY, {
        expiresIn: config.serverConfig.JWT_TOKEN_LIFETIME
    });
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
};

userSchema.methods.generateAuthTokenResetPassword = async function () {
    // Generate an auth token for the user reset password
    const user = this;
    const resetToken = new Date(Date.now() + (3600 * 1000 * 24)).getTime() + "-" + generate_secret_key(101);
    user.resetToken = resetToken;
    await user.save();
    return resetToken;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email}).populate('lang company');
    if (!user) {
        throw {...constant.errors.NOT_FIND_OBJECT, message: `email.not_found`};
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
        return user;
    }
    throw {...constant.errors.PARAM_INVALID, message: `password.wrong`};
};

userSchema.statics.getIgnoreUpdateAttr = function () {
    return ['_id', 'tokens', 'lastChangePw', "avatarPath"];
};

const User = mongoose.model('User', userSchema);

module.exports = User;