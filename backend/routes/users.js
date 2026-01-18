import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import PillReminder from '../models/PillReminder.js';

const router = express.Router();

// Create user after signup
router.post('/', verifyToken, async (req, res) => {
  try {
    const { role } = req.body;

    const existingUser = await User.findOne({ uid: req.user.uid });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      uid: req.user.uid,
      email: req.user.email,
      role
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reminder
router.put('/add-reminder', verifyToken, async (req, res) => {
  try {
    const reminder = new PillReminder({
      name: req.body.name,
      timesPerDay: req.body.timesPerDay,
      frequencyInDays: req.body.frequencyInDays
    });
    const user = await User.updateOne(
      { uid: req.user.uid },
      { $push: { pillReminders: reminder } }
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link a caregiver by email (current user is patient)
router.post('/link-caregiver', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    const patient = await User.findOne({ uid: req.user.uid });
    const caregiver = await User.findOne({ email: email.toLowerCase() });

    if (!patient || !caregiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (patient._id.equals(caregiver._id)) {
      return res.status(400).json({ error: 'Cannot link yourself' });
    }

    // Add caregiver to patient's list
    if (!patient.linkedCaregivers.some(id => id.equals(caregiver._id))) {
      patient.linkedCaregivers.push(caregiver._id);
      await patient.save();
    }

    // Add patient to caregiver's list
    if (!caregiver.linkedPatients.some(id => id.equals(patient._id))) {
      caregiver.linkedPatients.push(patient._id);
      await caregiver.save();
    }

    res.json({ message: 'Caregiver linked successfully', caregiver: { email: caregiver.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link a patient by email (current user is caregiver)
router.post('/link-patient', verifyToken, async (req, res) => {
  try {
    const { email } = req.body;

    const caregiver = await User.findOne({ uid: req.user.uid });
    const patient = await User.findOne({ email: email.toLowerCase() });

    if (!caregiver || !patient) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (caregiver._id.equals(patient._id)) {
      return res.status(400).json({ error: 'Cannot link yourself' });
    }

    // Add patient to caregiver's list
    if (!caregiver.linkedPatients.some(id => id.equals(patient._id))) {
      caregiver.linkedPatients.push(patient._id);
      await caregiver.save();
    }

    // Add caregiver to patient's list
    if (!patient.linkedCaregivers.some(id => id.equals(caregiver._id))) {
      patient.linkedCaregivers.push(caregiver._id);
      await patient.save();
    }

    res.json({ message: 'Patient linked successfully', patient: { email: patient.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
