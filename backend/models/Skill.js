const mongoose = require('mongoose');

/**
 * Message Schema - Contact form messages
 * Stores all messages sent from the contact form
 */
const MessageSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true 
    },
    subject: { 
        type: String, 
        default: 'No Subject',
        trim: true 
    },
    message: { 
        type: String, 
        required: [true, 'Message is required'],
        trim: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Index for better query performance
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ read: 1 });

module.exports = mongoose.model('Message', MessageSchema);