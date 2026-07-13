const express = require('express');
const Doctor = require('../models/Doctor');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = { isVerified: true, isDisabled: false };

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    let doctors = await Doctor.find(filter).populate('user', 'name email phone');

    if (search) {
      const term = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.user.name.toLowerCase().includes(term) ||
          d.specialization.toLowerCase().includes(term) ||
          d.qualification.toLowerCase().includes(term)
      );
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/specializations', async (_req, res) => {
  try {
    const specs = await Doctor.distinct('specialization', { isVerified: true, isDisabled: false });
    res.json(specs.sort());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      isVerified: true,
      isDisabled: false,
    }).populate('user', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
