const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const User = require('../Model/user.model');

const auth = require('../Middleware/auth.middleware');

const { authorize } = require('../Middleware/rbac.middleware');


router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, age, phone, role } = req.body;

        if (!name || !email || !password || !age || !phone) {
            return res.status(400).json({ message: 'All fields (name, email, password, age, phone) are required' });
        }

       
        if (role && !['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Role must be: 'user', 'moderator', or 'admin'" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            phone,
            role: role || 'user' 
        });

        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'RBAC User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token with role in the payload
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/public', (req, res) => {
    res.json({
        access: 'Public',
        message: 'Welcome! This page is open to the public.'
    });
});


router.get('/profile', auth, authorize(['user', 'moderator', 'admin']), (req, res) => {
    res.json({
        access: 'Authenticated Users Only',
        message: `Hello ${req.user.email}! You are authorized because your role is: '${req.user.role}'`,
        user: req.user
    });
});


router.get('/moderator', auth, authorize(['moderator', 'admin']), (req, res) => {
    res.json({
        access: 'Moderators & Admins Only',
        message: 'Welcome to the Moderator Control Panel. You can flag or delete posts here.',
        actionsAllowed: ['flag_post', 'delete_post_flag', 'view_reports']
    });
});


router.get('/admin', auth, authorize(['admin']), (req, res) => {
    res.json({
        access: 'Admins Only',
        message: 'Welcome to the Admin System Configuration Panel. Full system controls unlocked.',
        systemMetrics: {
            activeConnections: 12,
            dbStatus: 'Healthy'
        }
    });
});

module.exports = router;
