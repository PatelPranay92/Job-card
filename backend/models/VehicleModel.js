const mongoose = require('mongoose');

const VehicleModelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['Bike', 'Scooter', 'Car'], default: 'Bike' }
}, { timestamps: true });

module.exports = mongoose.model('VehicleModel', VehicleModelSchema);
