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
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
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
  // Pending invitations sent by this user
  pendingInvitationsSent: [{
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['caregiver', 'patient']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Pending invitations received by this user
  pendingInvitationsReceived: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['caregiver', 'patient']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Notification preferences
  notificationPreferences: {
    email: {
      enabled: { type: Boolean, default: true },
      upcoming: { type: Boolean, default: true },
      pending: { type: Boolean, default: true },
      taken: { type: Boolean, default: false },
      missed: { type: Boolean, default: true }
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      upcoming: { type: Boolean, default: true },
      pending: { type: Boolean, default: true },
      taken: { type: Boolean, default: true },
      missed: { type: Boolean, default: true }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
