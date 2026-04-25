const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// ─── Cached MongoDB connection for serverless (Vercel) ───────────────────────
let isConnected = false;

async function connectDB() {
    if (isConnected) return;

    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false,       // Disable mongoose buffering
    });

    isConnected = true;
    console.log('MongoDB Connected');

    // Auto-seed Admin user if collection is empty
    const User = require('./models/User');
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            await new User({ username: 'admin', password: 'admin', name: 'Administrator' }).save();
            console.log('Admin user seeded (admin/admin)');
        }
    } catch (e) {
        console.error('Seeding error', e);
    }
}

// Middleware to ensure DB is connected before handling any request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection error:', err);
        res.status(500).json({ message: 'Database connection failed', error: err.message });
    }
});
// ─────────────────────────────────────────────────────────────────────────────

// Routes
const jobcardsRouter = require('./routes/jobcards');
const authRouter = require('./routes/auth');

app.use('/api/jobcards', jobcardsRouter);
app.use('/api/auth', authRouter);
app.use('/api/models', require('./routes/models'));

// Root route
app.get('/', (req, res) => {
    res.send('Jobcard API is running...');
});

// Daily Stats Route
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

// For local development only
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }).catch(err => console.error(err));
}

module.exports = app;
