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

export default router;
