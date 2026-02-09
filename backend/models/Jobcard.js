const mongoose = require('mongoose');
const Counter = require('./Counter');

const ItemSchema = new mongoose.Schema({
    name: String,
    amount: Number
});

const JobcardSchema = new mongoose.Schema({
    jobcard_no: { type: String, unique: true }, // JC-00001
    seq_id: { type: Number }, // Raw number 1, 2, 3
    date: { type: Date, default: Date.now },

    // Customer Info
    customer_name: { type: String, required: true, uppercase: true },
    phone: String,
    address: { type: String, uppercase: true },
    city: { type: String, uppercase: true },

    // Vehicle Info
    reg_no: { type: String, required: true, uppercase: true },
    model_name: { type: String, uppercase: true },
    chassis_no: { type: String, uppercase: true },
    engine_no: { type: String, uppercase: true },
    km: String,
    petrol: String,
    key_no: String,
    vehicle_type: String,
    mechanic_name: String,
    helper_name: String,
    remarks: String,

    // Details
    services: [ItemSchema],
    parts: [ItemSchema],
    labour: [ItemSchema],

    // Totals
    amount: { type: Number, default: 0 }, // Grand Total
    paid: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Paid', 'Partial', 'Unpaid'],
        default: 'Unpaid'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field to map _id to jobcard_id for frontend compatibility
JobcardSchema.virtual('jobcard_id').get(function () {
    return this._id.toString();
});


// Pre-save hook to auto-increment
JobcardSchema.pre('save', async function () {
    if (!this.isNew) return;

    const counter = await Counter.findOneAndUpdate(
        { id: 'jobcard_id' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    this.seq_id = counter.seq;
    // Format JC-00001
    this.jobcard_no = `JC-${String(counter.seq).padStart(5, '0')}`;
});

module.exports = mongoose.model('Jobcard', JobcardSchema);
