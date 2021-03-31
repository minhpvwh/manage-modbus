const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const schema = new mongoose.Schema({
    _id: {type: ObjectId, auto: true},
    name: {type: String, required: true, trim: true, unique: true},
    code: {type: String, required: true, trim: true, unique: true},
}, {
    timestamps: true,
    _id: false,
});

module.exports = mongoose.model('Language', schema);