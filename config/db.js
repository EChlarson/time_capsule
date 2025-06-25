require('dotenv').config();
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    // Connect MongoDB client for ping
    await client.connect();
    await client.db('timecapsule').command({ ping: 1 });
    console.log('Pinged MongoDB. Successfully connected!');

    // Connect Mongoose
    await mongoose.connect(uri);
    console.log('Mongoose connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
};

connectDB();

module.exports = connectDB;