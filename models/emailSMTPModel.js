const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const EmailSchema = new mongoose.Schema(
    {
        _id: {type: ObjectId, auto: true},
        email: { type: String, trim: true }
    },
    {
        _id: false,
    },
);

const emailSMTPSchema = new mongoose.Schema({
    _id: {type: ObjectId, auto: true},
    host: {type: String, trim: true},
    port: {type: Number, trim: true},
    user: {type: String, trim: true},
    pass: {type: String, trim: true},
    from: {type: String, trim: true},
    to: {type: [EmailSchema], default: []},
    default: {type: Boolean, default: false},
}, {
    timestamps: true,
    _id: false,
});

module.exports = mongoose.model('EmailSMTP', emailSMTPSchema);