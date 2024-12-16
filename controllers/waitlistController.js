// controllers/waitlistController.js
const Waitlist = require("../models/WaitList.js");

// Controller function to add an email to the waitlist
exports.addEmailToWaitlist = async (req, res) => {
  const { email } = req.body;

  // Validate the email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    // Check if the email is already in the waitlist
    const existingEmail = await Waitlist.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already on the waitlist' });
    }

    // Create a new entry in the waitlist
    const newWaitlistEntry = new Waitlist({ email });
    await newWaitlistEntry.save();

    res.status(201).json({ message: 'Email added to waitlist successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding email to waitlist', error: err });
  }
};

// Controller function to get all emails on the waitlist (admin only)
exports.getWaitlistEmails = async (req, res) => {
  try {
    const emails = await Waitlist.find();
    res.status(200).json({ emails });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching waitlist emails', error: err });
  }
};
