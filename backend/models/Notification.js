import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['upcoming', 'pending', 'taken', 'missed'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  pillReminder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PillReminder'
  },
  scheduledTime: {
    type: String // e.g., "09:00"
  },
  read: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
