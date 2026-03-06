const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: { type: String, default: 'Dhiraj Dhakal' },
    title: { type: String, default: 'BICTE Student | Developer | Tech Enthusiast' },
    bio: { type: String, default: 'Crafting digital experiences with code and creativity.' },
    aboutText: { type: String, default: 'BICTE student passionate about web development.' },
    email: { type: String, default: 'dhiraj@example.com' },
    phone: { type: String, default: '+977 9812345678' },
    location: { type: String, default: 'Kathmandu, Nepal' },
    country: { type: String, default: 'Nepal' },
    experience: { type: String, default: '2+' },
    initials: { type: String, default: 'D' },
    education: { type: String, default: 'BICTE (2022 - Present)' },
    profileImage: { type: String, default: null },
    aboutImage: { type: String, default: null },
    cvLink: { type: String, default: '#' },
    website: { type: String, default: 'www.dhiraj.com.np' },
    shortBio: { type: String, default: 'Creating digital experiences that make a difference.' },
    contactTitle: { type: String, default: "Let's work together" },
    contactText: { type: String, default: "I'm always interested in hearing about new opportunities." },
    stats: {
        projects: { type: String, default: '15+' },
        certificates: { type: String, default: '8' },
        clients: { type: String, default: '10+' },
        years: { type: String, default: '2' }
    },
    socialLinks: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);