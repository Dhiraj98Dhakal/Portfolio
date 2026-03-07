const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    github: { type: String, default: '' },
    demo: { type: String, default: '' },
    image: { type: String, default: null },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);