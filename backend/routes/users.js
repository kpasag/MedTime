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
      .populate('pillReminders')
      .populate('linkedPatients', 'email')
      .populate('linkedCaregivers', 'email');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pill reminders for the current user
router.get('/reminders', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid })
      .populate('pillReminders');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.pillReminders || []);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add reminder
router.post('/add-reminder', verifyToken, async (req, res) => {
  try {
    const { name, dosage, timesPerDay, frequencyInDays } = req.body;

    const reminder = new PillReminder({
      name,
      dosage,
      timesPerDay,
      frequencyInDays
    });
    await reminder.save();

    const result = await User.updateOne(
      { uid: req.user.uid },
      { $push: { pillReminders: reminder._id } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error adding reminder:', error);
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

// Delete a reminder
router.delete('/delete-reminder/:reminderId', verifyToken, async (req, res) => {
  try {
    const { reminderId } = req.params;

    // Remove from user's pill reminders array
    const result = await User.updateOne(
      { uid: req.user.uid },
      { $pull: { pillReminders: reminderId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the reminder document
    await PillReminder.findByIdAndDelete(reminderId);

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a reminder
router.put('/update-reminder/:reminderId', verifyToken, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { name, dosage, timesPerDay, frequencyInDays } = req.body;

    const reminder = await PillReminder.findByIdAndUpdate(
      reminderId,
      { name, dosage, timesPerDay, frequencyInDays },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark a specific dose as taken
router.post('/mark-taken/:reminderId', verifyToken, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { time, scheduledFor } = req.body; // time is like "09:00", scheduledFor is the date

    const reminder = await PillReminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Initialize lastTaken array if it doesn't exist
    if (!reminder.lastTaken) {
      reminder.lastTaken = [];
    }

    // Find if this time already has a record for today
    const existingIndex = reminder.lastTaken.findIndex(
      lt => lt.time === time && 
      new Date(lt.scheduledFor).toDateString() === new Date(scheduledFor).toDateString()
    );

    const takenRecord = {
      time,
      takenAt: new Date(),
      scheduledFor: new Date(scheduledFor)
    };

    if (existingIndex >= 0) {
      // Update existing record
      reminder.lastTaken[existingIndex] = takenRecord;
    } else {
      // Add new record
      reminder.lastTaken.push(takenRecord);
    }

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('Error marking pill as taken:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unmark a dose (set back to pending)
router.post('/unmark-taken/:reminderId', verifyToken, async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { time, scheduledFor } = req.body;

    const reminder = await PillReminder.findById(reminderId);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Remove the taken record for this specific time/date
    if (reminder.lastTaken) {
      reminder.lastTaken = reminder.lastTaken.filter(
        lt => !(lt.time === time && 
        new Date(lt.scheduledFor).toDateString() === new Date(scheduledFor).toDateString())
      );
    }

    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('Error unmarking pill:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
