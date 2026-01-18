import mongoose from 'mongoose';

const pillreminderSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: Number,
    require: true
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

export default mongoose.model('User', userSchema);
