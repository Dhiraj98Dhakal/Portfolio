const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    level: { 
        type: Number, 
        min: 0, 
        max: 100, 
        required: true 
    },
    icon: { 
        type: String, 
        required: true 
    },
    color: { 
        type: String, 
        default: '#00f3ff' 
    },
    category: { 
        type: String, 
        default: 'general',
        enum: ['frontend', 'backend', 'database', 'tools', 'design', 'general']
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Skill', SkillSchema);