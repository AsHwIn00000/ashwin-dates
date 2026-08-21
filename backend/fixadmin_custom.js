require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Warning: Could not set custom DNS servers, SRV resolution might fail:', e.message);
}

async function fix() {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 - fixes DNS/SRV issues on some networks
  });
  console.log('Connected to MongoDB');

  const email = 'ashwindatesanddryfruits@gmail.com';
  const password = 'ashwin2007';

  let user = await User.findOne({ email });

  if (user) {
    console.log(`Found existing user with email ${email}, updating to admin and resetting password...`);
    user.password = password;
    user.role = 'admin';
    user.isVerified = true;
    await user.save();
    console.log('User updated successfully.');
  } else {
    console.log(`User ${email} not found. Creating new admin user...`);
    user = new User({
      name: 'Ashwin Admin',
      email,
      password,
      role: 'admin',
      isVerified: true
    });
    await user.save();
    console.log('Admin user created successfully.');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fix().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
