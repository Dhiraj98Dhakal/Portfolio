// backend/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('\n' + '='.repeat(50));
        console.log('✅ MongoDB Connected Successfully');
        console.log('='.repeat(50));
        console.log('📍 Database:', conn.connection.name);
        console.log('📍 Host:', conn.connection.host);
        console.log('='.repeat(50) + '\n');
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:', error.message);
        console.log('\n💡 Tips:');
        console.log('1. Check your password in .env file');
        console.log('2. Make sure MongoDB Atlas IP whitelist has 0.0.0.0/0');
        console.log('3. Check your network connection\n');
        process.exit(1);
    }
};

module.exports = connectDB;