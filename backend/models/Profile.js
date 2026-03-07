const mongoose = require('mongoose');

/**
 * Profile Schema - Personal information and settings
 * Stores all profile data including personal info, stats, and social links
 */
const ProfileSchema = new mongoose.Schema({
    // Personal Information
    name: { 
        type: String, 
        default: 'Dhiraj Dhakal' 
    },
    title: { 
        type: String, 
        default: 'BICTE Student | Developer | Tech Enthusiast' 
    },
    bio: { 
        type: String, 
        default: 'Crafting digital experiences with code and creativity.' 
    },
    aboutText: { 
        type: String, 
        default: 'BICTE student passionate about web development and technology.' 
    },
    
    // Contact Information
    email: { 
        type: String, 
        default: 'dhiraj@example.com' 
    },
    phone: { 
        type: String, 
        default: '+977 9808704655' 
    },
    location: { 
        type: String, 
        default: 'Morang, Nepal' 
    },
    country: { 
        type: String, 
        default: 'Nepal' 
    },
    
    // Professional Information
    experience: { 
        type: String, 
        default: '2+' 
    },
    initials: { 
        type: String, 
        default: 'D',
        maxlength: 2 
    },
    education: { 
        type: String, 
        default: 'BICTE (2022 - Present)' 
    },
    
    // Images
    profileImage: { 
        type: String, 
        default: null 
    },
    aboutImage: { 
        type: String, 
        default: null 
    },
    
    // Links
    cvLink: { 
        type: String, 
        default: '#' 
    },
    website: { 
        type: String, 
        default: 'www.dhiraj.com.np' 
    },
    
    // Text Content
    shortBio: { 
        type: String, 
        default: 'Creating digital experiences that make a difference.' 
    },
    contactTitle: { 
        type: String, 
        default: "Let's work together" 
    },
    contactText: { 
        type: String, 
        default: "I'm always interested in hearing about new opportunities." 
    },
    
    // Statistics - Shown in about section
    stats: {
        projects: { type: String, default: '15+' },
        certificates: { type: String, default: '8' },
        clients: { type: String, default: '10+' },
        years: { type: String, default: '2' }
    },
    
    // Social Media Links - All platforms
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        youtube: { type: String, default: '' },
        discord: { type: String, default: '' },
        medium: { type: String, default: '' }
    }
}, { 
    timestamps: true 
});

// Ensure only one profile exists
ProfileSchema.statics.getProfile = async function() {
    const profile = await this.findOne();
    if (profile) return profile;
    return this.create({});
};

module.exports = mongoose.model('Profile', ProfileSchema);