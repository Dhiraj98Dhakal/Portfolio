const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: { type: String, default: 'Dhiraj Dhakal' },
    title: { type: String, default: 'BICTE Student | Developer | Tech Enthusiast' },
    bio: { type: String, default: 'Crafting digital experiences' },
    aboutText: { type: String, default: 'BICTE student passionate about web development' },
    email: { type: String, default: 'dhiraj@example.com' },
    phone: { type: String, default: '+977 9808704655' },
    location: { type: String, default: 'Morang, Nepal' },
    country: { type: String, default: 'Nepal' },
    experience: { type: String, default: '2+' },
    initials: { type: String, default: 'D' },
    education: { type: String, default: 'BICTE (2022 - Present)' },
    profileImage: { type: String, default: null },
    aboutImage: { type: String, default: null },
    shortBio: { type: String, default: 'Creating digital experiences' },
    stats: {
        projects: { type: String, default: '15+' },
        certificates: { type: String, default: '8' },
        clients: { type: String, default: '10+' },
        years: { type: String, default: '2' }
    },
    socialLinks: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        youtube: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);