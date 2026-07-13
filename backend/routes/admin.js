const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/doctors', async (_req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/doctors', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio,
      availability,
      isVerified,
    } = req.body;

    if (!name || !email || !password || !specialization || !qualification || experience == null || consultationFee == null) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password, phone, role: 'doctor' });

    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio: bio || '',
      availability: availability || [],
      isVerified: isVerified ?? false,
    });

    const populated = await Doctor.findById(doctor._id).populate('user', 'name email phone');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const {
      name,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      bio,
      availability,
      isVerified,
      isDisabled,
    } = req.body;

    if (name || phone) {
      await User.findByIdAndUpdate(doctor.user, {
        ...(name && { name }),
        ...(phone && { phone }),
      });
    }

    Object.assign(doctor, {
      ...(specialization && { specialization }),
      ...(qualification && { qualification }),
      ...(experience != null && { experience }),
      ...(consultationFee != null && { consultationFee }),
      ...(bio != null && { bio }),
      ...(availability && { availability }),
      ...(isVerified != null && { isVerified }),
      ...(isDisabled != null && { isDisabled }),
    });

    await doctor.save();

    const populated = await Doctor.findById(doctor._id).populate('user', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/doctors/:id/verify', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, isDisabled: false },
      { new: true }
    ).populate('user', 'name email phone');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/doctors/:id/disable', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isDisabled: true },
      { new: true }
    ).populate('user', 'name email phone');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await Appointment.deleteMany({ doctor: doctor._id });
    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(doctor._id);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/appointments', async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
