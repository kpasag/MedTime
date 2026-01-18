import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  pillReminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PillReminder'
  }],
  linkedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  linkedCaregivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
