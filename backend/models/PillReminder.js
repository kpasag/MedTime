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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PillReminder', pillReminderSchema);
