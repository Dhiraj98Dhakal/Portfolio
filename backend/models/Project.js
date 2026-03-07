const mongoose = require('mongoose');

/**
 * Project Schema - Portfolio projects
 * Stores all project information including technologies and links
 */
const ProjectSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Project title is required'],
        trim: true 
    },
    description: { 
        type: String, 
        required: [true, 'Project description is required'],
        trim: true 
    },
    technologies: [{ 
        type: String,
        trim: true 
    }],
    github: { 
        type: String, 
        default: '',
        trim: true 
    },
    demo: { 
        type: String, 
        default: '',
        trim: true 
    },
    image: { 
        type: String, 
        default: null 
    },
    featured: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Indexes for better performance
ProjectSchema.index({ featured: -1, createdAt: -1 });
ProjectSchema.index({ technologies: 1 });

module.exports = mongoose.model('Project', ProjectSchema);