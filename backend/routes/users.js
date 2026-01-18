import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import PillReminder from '../models/PillReminder.js';

const router = express.Router();

// Create user after signup
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating user:', req.user.uid, req.user.email);

    const existingUser = await User.findOne({ uid: req.user.uid });
    if (existingUser) {
      console.log('User already exists:', existingUser._id);
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      uid: req.user.uid,
      email: req.user.email
    });

    await user.save();
    console.log('User created successfully:', user._id);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
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
    user.save()

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

    // Check if already linked
    if (patient.linkedCaregivers.some(id => id.toString() === caregiver._id.toString())) {
      return res.status(400).json({ error: 'Caregiver already linked' });
    }

    // Use $addToSet to prevent duplicates at database level
    await User.updateOne(
      { _id: patient._id },
      { $addToSet: { linkedCaregivers: caregiver._id } }
    );

    await User.updateOne(
      { _id: caregiver._id },
      { $addToSet: { linkedPatients: patient._id } }
    );

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

    // Check if already linked
    if (caregiver.linkedPatients.some(id => id.toString() === patient._id.toString())) {
      return res.status(400).json({ error: 'Patient already linked' });
    }

    // Use $addToSet to prevent duplicates at database level
    await User.updateOne(
      { _id: caregiver._id },
      { $addToSet: { linkedPatients: patient._id } }
    );

    await User.updateOne(
      { _id: patient._id },
      { $addToSet: { linkedCaregivers: caregiver._id } }
    );

    res.json({ message: 'Patient linked successfully', patient: { email: patient.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
