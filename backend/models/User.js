const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In real app, hash this!
    name: String,
    role: { type: String, default: 'Admin' }
});

module.exports = mongoose.model('User', UserSchema);
