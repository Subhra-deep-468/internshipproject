const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('patient'), async (req, res) => {
  try {
    const { doctorId, reason, requestedDate } = req.body;

    if (!doctorId || !reason || !requestedDate) {
      return res.status(400).json({ message: 'Doctor, reason, and requested date are required' });
    }

    const doctor = await Doctor.findOne({ _id: doctorId, isVerified: true, isDisabled: false });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not available for booking' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      reason,
      requestedDate: new Date(requestedDate),
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'patient') {
      filter.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return res.json([]);
      filter.doctor = doctor._id;
    } else if (req.user.role === 'admin') {
      // admin sees all
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/cancel', authorize('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user._id });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!['pending', 'accepted'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot cancel this appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/accept', authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id, status: 'pending' });

    if (!appointment) {
      return res.status(404).json({ message: 'Pending appointment not found' });
    }

    appointment.status = 'accepted';
    if (req.body.scheduledTime) {
      appointment.scheduledTime = req.body.scheduledTime;
    }
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/reject', authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointment = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id, status: 'pending' });

    if (!appointment) {
      return res.status(404).json({ message: 'Pending appointment not found' });
    }

    appointment.status = 'rejected';
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/schedule', authorize('doctor'), async (req, res) => {
  try {
    const { scheduledTime } = req.body;
    if (!scheduledTime) {
      return res.status(400).json({ message: 'Scheduled time is required' });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
      status: 'accepted',
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Accepted appointment not found' });
    }

    appointment.scheduledTime = scheduledTime;
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/complete', authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
      status: 'accepted',
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Accepted appointment not found' });
    }

    appointment.status = 'completed';
    await appointment.save();

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } });

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
