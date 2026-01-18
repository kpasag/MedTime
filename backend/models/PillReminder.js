import mongoose from 'mongoose';

const pillReminderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  timesPerDay: [{
    type: String,
    required: true
  }],
  frequencyInDays: {
    type: Number,
    required: true
  },
  // Track when medication was last taken for each scheduled time
  lastTaken: [{
    time: String, // e.g., "09:00"
    takenAt: Date, // timestamp when marked as taken
    scheduledFor: Date // the specific date/time this dose was scheduled for
  }],
  // Next scheduled date (updated based on frequencyInDays)
  nextScheduledDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PillReminder', pillReminderSchema);
