const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        default: 'No Subject' 
    },
    message: { 
        type: String, 
        required: true 
    },
    read: { 
        type: Boolean, 
        default: false 
    },
    ip: { 
        type: String 
    },
    userAgent: { 
        type: String 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Message', MessageSchema);