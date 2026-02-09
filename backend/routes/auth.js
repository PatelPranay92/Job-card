const express = require('express');
const router = express.Router();
const User = require('../models/User');

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });

        if (user) {
            // Return user info (no token for this simple migration unless needed)
            res.json({
                username: user.username,
                name: user.name,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const user = await User.findOne({ username, password: currentPassword });

        if (user) {
            user.password = newPassword;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Current password incorrect' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Seed default users if not exists
router.get('/seed', async (req, res) => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        const userExists = await User.findOne({ username: 'user' });

        const created = [];

        if (!adminExists) {
            await new User({
                username: 'admin',
                password: 'admin123',
                name: 'Administrator',
                role: 'Admin'
            }).save();
            created.push('Admin (admin/admin123)');
        }

        if (!userExists) {
            await new User({
                username: 'user',
                password: 'user123',
                name: 'Normal User',
                role: 'User'
            }).save();
            created.push('User (user/user123)');
        }

        if (created.length > 0) {
            res.json({ message: `Created users: ${created.join(', ')}` });
        } else {
            res.json({ message: 'All default users already exist' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
