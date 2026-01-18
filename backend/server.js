import express from 'express';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './middleware/authMiddleware.js';
import userRoutes from './routes/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Drop old uid index if it exists
    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name: 'pillreminders' }).toArray();
      if (collections.length > 0) {
        await db.collection('pillreminders').dropIndex('uid_1');
        console.log('Dropped old uid_1 index');
      }
    } catch (err) {
      // Index might not exist, that's ok
      if (err.code !== 27) { // 27 = IndexNotFound
        console.log('No old index to drop or already dropped');
      }
    }
  })
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
