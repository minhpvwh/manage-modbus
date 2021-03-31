const mongoose = require('mongoose');
const {generate_client_id, generate_secret_key} = require('../utils/utils');
const ObjectId = mongoose.Types.ObjectId;
const companySchema = new mongoose.Schema({
    _id: {type: ObjectId, auto: true},
    name: {type: String, required: true},
    timeZone: {type: Number, required: true, default: 7},
    description: {type: String},
    root: {type: ObjectId, ref: 'User'},
    secretKey: {type: String, default: ''},
    appKey: {type: String, default: ''},
    expiredDate: {type: Date},
    codePackage: {type: String, trim: true},
    sizeEmployee: {type: Number},
    status: {type: String, enum: ["approve", "pause", "cancel"], default: "approve"},
    version: {type: Number, default: 0},
}, {
    timestamps: true,
    _id: false,
});

companySchema.pre('save', function (next) {
    const self = this;
    self.secretKey = generate_secret_key(16);
    self.appKey = generate_client_id();
    next();
});

companySchema.methods.updateCompanyVersion = async function () {
    const company = this;
    company.version += 1;
    await company.save();
};

module.exports = mongoose.model('Company', companySchema);
