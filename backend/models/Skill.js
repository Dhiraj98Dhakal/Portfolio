const mongoose = require('mongoose');

/**
 * Skill Schema - Technical skills
 * Stores skills with icons, levels, and categories
 */
const SkillSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Skill name is required'],
        trim: true,
        unique: true 
    },
    level: { 
        type: Number, 
        required: [true, 'Skill level is required'],
        min: [0, 'Level must be between 0 and 100'],
        max: [100, 'Level must be between 0 and 100']
    },
    icon: { 
        type: String, 
        required: [true, 'Icon class is required'],
        trim: true 
    },
    color: { 
        type: String, 
        default: '#00f3ff',
        match: [/^#[0-9A-F]{6}$/i, 'Invalid color format'] 
    },
    category: { 
        type: String, 
        enum: ['frontend', 'backend', 'database', 'tools', 'design', 'general'],
        default: 'general' 
    }
}, { 
    timestamps: true 
});

// Index for sorting by level
SkillSchema.index({ level: -1 });
SkillSchema.index({ category: 1 });

module.exports = mongoose.model('Skill', SkillSchema);