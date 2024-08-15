const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const userSchema = require('../Schemas/UserSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = mongoose.model('User', userSchema);

// SIGN UP
router.post('/signup', async (req, res) => {
    try {
        const { name, userName, password } = req.body;

        // Check if username already exists
        const isExistingUser = await User.findOne({ userName });
        if (isExistingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create and save new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, userName, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET USERS
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ message: 'Users fetched successfully', users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { userName, password } = req.body;
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        // Generate token
        const token = jwt.sign({
            userId: user._id,
            userName: user.userName
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ message: 'Login Successful', "access-token": token });
    } catch (error) {
        res.status(500).json({ message: 'Login Failed', error: error.message });
    }
});

module.exports = router;
