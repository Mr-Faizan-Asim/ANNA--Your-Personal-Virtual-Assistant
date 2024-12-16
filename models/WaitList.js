// models/Waitlist.js
const mongoose = require('mongoose');

// Define the schema for the Waitlist
const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensure emails are unique
    lowercase: true, // Convert email to lowercase before saving
    trim: true, // Remove any leading or trailing whitespace
  },
}, { timestamps: true }); // Add timestamps for createdAt and updatedAt

// Create the model
const Waitlist = mongoose.model('Waitlist', waitlistSchema);

module.exports = Waitlist;
