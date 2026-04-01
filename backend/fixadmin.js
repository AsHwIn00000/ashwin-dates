require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await User.findOneAndUpdate(
    { email: 'admin@ashwindates.com' },
    { role: 'admin' },
    { new: true }
  );
  if (result) {
    console.log(`Fixed: ${result.email} is now role = ${result.role}`);
  } else {
    console.log('User not found, creating admin...');
    await User.create({ name: 'Admin', email: 'admin@ashwindates.com', password: 'Admin@123', role: 'admin' });
    console.log('Admin created');
  }
  await mongoose.disconnect();
}

fix().catch(console.error);
