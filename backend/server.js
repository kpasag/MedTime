const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const app = express();
const { verifyToken } = require('./middleware/authMiddleware');

app.use(express.json());

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