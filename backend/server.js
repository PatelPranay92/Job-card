const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(
    {
        origin: '*',
        credentials: true
    }
));
app.use(express.json());

// Routes
const jobcardsRouter = require('./routes/jobcards');
const authRouter = require('./routes/auth');

app.use('/api/jobcards', jobcardsRouter);
app.use('/api/auth', authRouter);
app.use('/api/models', require('./routes/models'));

// Daily Stats Route (Quick inline)
const Jobcard = require('./models/Jobcard');
app.get('/api/stats/daily', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const jobcards = await Jobcard.find({
            date: { $gte: today }
        });

        const total = jobcards.reduce((sum, jc) => sum + (jc.paid || 0), 0);
        res.json({ total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const User = require('./models/User');
console.log(process.env.MONGO_URI);
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)


    .then(async () => {
        console.log('MongoDB Connected');

        // Auto-seed Admin
        try {
            const count = await User.countDocuments();
            if (count === 0) {
                await new User({ username: 'admin', password: 'admin', name: 'Administrator' }).save();
                console.log('Admin user seeded (admin/admin)');
            }
        } catch (e) { console.error('Seeding error', e); }

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));
