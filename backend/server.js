import express from 'express';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';
import { verifyToken } from './middleware/authMiddleware.js';
import userRoutes from './routes/users.js';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const app = express();
app.use(cors({ origin: 'http://localhost:5000', credentials: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Test route - protected
app.get('/api/test', verifyToken, (req, res) => {
  res.json({
    message: 'Token verified successfully!',
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
