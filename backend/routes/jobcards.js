const express = require('express');
const router = express.Router();
const Jobcard = require('../models/Jobcard');

// GET all jobcards (with optional basic search)
router.get('/', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = {};

        // Date range filter
        if (start_date && end_date) {
            query.date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        } else if (start_date) { // If only start date i.e. "Today" logic
            query.date = {
                $gte: new Date(new Date(start_date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(start_date).setHours(23, 59, 59, 999))
            };
        }

        // Sort by newest first
        const jobcards = await Jobcard.find(query).sort({ date: -1, seq_id: -1 });
        res.json(jobcards);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single jobcard
router.get('/:id', async (req, res) => {
    try {
        // Try to find by _id first, if fails or looks like jobcard_no/seq_id handle that
        // But for simplicity let's stick to _id for React routing.
        // However, user might search by jobcard_no.

        // Check if valid ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);

        let jobcard;
        if (isValidObjectId) {
            jobcard = await Jobcard.findById(req.params.id);
        } else {
            // use seq_id if numeric or jobcard_no string
            const numericId = parseInt(req.params.id);
            if (!isNaN(numericId)) {
                jobcard = await Jobcard.findOne({ seq_id: numericId });
            } else {
                jobcard = await Jobcard.findOne({ jobcard_no: req.params.id });
            }
        }

        if (!jobcard) return res.status(404).json({ message: 'Jobcard not found' });
        res.json(jobcard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE jobcard
router.post('/', async (req, res) => {
    try {
        // Convert date to Indian timezone if provided
        if (req.body.date) {
            const inputDate = new Date(req.body.date);
            // Create date in IST timezone
            const istDate = new Date(inputDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            req.body.date = istDate;
        }

        const jc = new Jobcard(req.body);
        const newJobcard = await jc.save();
        res.status(201).json(newJobcard);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE jobcard
router.put('/:id', async (req, res) => {
    try {
        const jobcard = await Jobcard.findById(req.params.id);
        if (!jobcard) return res.status(404).json({ message: 'Jobcard not found' });

        // Convert date to Indian timezone if provided
        if (req.body.date) {
            const inputDate = new Date(req.body.date);
            const istDate = new Date(inputDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            req.body.date = istDate;
        }

        Object.assign(jobcard, req.body);

        // Recalculate status if amounts changed (optional backend logic safety)
        if (jobcard.remaining <= 0) jobcard.status = 'Paid';
        else if (jobcard.paid > 0) jobcard.status = 'Partial';
        else jobcard.status = 'Unpaid';

        const updatedJobcard = await jobcard.save();
        res.json(updatedJobcard);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE jobcard
router.delete('/:id', async (req, res) => {
    try {
        const jobcard = await Jobcard.findById(req.params.id);
        if (!jobcard) return res.status(404).json({ message: 'Jobcard not found' });

        await jobcard.deleteOne();
        res.json({ message: 'Jobcard deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// SEARCH jobcards (advanced)
router.post('/search', async (req, res) => {
    try {
        const { startDate, endDate, jobcardNo, customerName, regNo, phone, modelId, city, chassisNo, mechanicName, helperName } = req.body;

        let query = {};

        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        if (jobcardNo) query.jobcard_no = { $regex: jobcardNo, $options: 'i' };
        if (customerName) query.customer_name = { $regex: customerName, $options: 'i' };
        if (regNo) query.reg_no = { $regex: regNo, $options: 'i' };
        if (phone) query.phone = { $regex: phone, $options: 'i' };
        if (city) query.city = { $regex: city, $options: 'i' };
        if (chassisNo) query.chassis_no = { $regex: chassisNo, $options: 'i' };
        if (mechanicName) query.mechanic_name = { $regex: mechanicName, $options: 'i' };
        // ... add other fields as needed

        const results = await Jobcard.find(query).sort({ date: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PROCESS PAYMENT
router.post('/:id/pay', async (req, res) => {
    try {
        const { amount, method } = req.body;
        const jobcard = await Jobcard.findById(req.params.id);
        if (!jobcard) return res.status(404).json({ message: 'Jobcard not found' });

        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        if (payAmount > jobcard.remaining) {
            return res.status(400).json({ message: 'Payment exceeds remaining amount' });
        }

        jobcard.paid += payAmount;
        jobcard.remaining -= payAmount;

        if (jobcard.remaining <= 0) jobcard.status = 'Paid';
        else jobcard.status = 'Partial';

        // You might want to save a transaction log here in a separate collection

        await jobcard.save();
        res.json(jobcard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
