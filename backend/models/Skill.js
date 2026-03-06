const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: Number, min: 0, max: 100, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: '#4f46e5' },
    category: { type: String, default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);