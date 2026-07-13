const jwt = require('jsonwebtoken');
const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendUserResponse = (user, res, status = 200) => {
  res.status(status).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    token: signToken(user._id),
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'patient' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const allowedRoles = ['patient', 'doctor'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role });

    if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialization: 'Pending',
        qualification: 'Pending',
        experience: 0,
        consultationFee: 0,
        isVerified: false,
      });
    }

    sendUserResponse(user, res, 201);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (!doctor || !doctor.isVerified) {
        return res.status(403).json({ message: 'Doctor account not verified by admin yet' });
      }
      if (doctor.isDisabled) {
        return res.status(403).json({ message: 'Doctor account has been disabled' });
      }
    }

    sendUserResponse(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    let doctorProfile = null;

    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      doctorProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
