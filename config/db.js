const mongoose = require('mongoose');
require('dotenv').config();

/**
 * MongoDB Connection Configuration
 * Handles database connection with retry logic
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ MONGODB CONNECTED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`📍 Database: ${conn.connection.name}`);
        console.log(`📍 Host: ${conn.connection.host}`);
        console.log(`📍 Port: ${conn.connection.port}`);
        console.log('='.repeat(60) + '\n');
        
        // Handle connection errors after initial connection
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:', error.message);
        console.log('\n💡 Tips:');
        console.log('1. Check your password in .env file');
        console.log('2. Make sure MongoDB Atlas IP whitelist has 0.0.0.0/0');
        console.log('3. Check your network connection\n');
        
        // Retry connection after 5 seconds
        console.log('🔄 Retrying connection in 5 seconds...\n');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;