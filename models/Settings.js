const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    siteTitle: { type: String, default: 'Dhiraj Dhakal - Portfolio' },
    siteDescription: { type: String, default: 'BICTE Student | Developer | Tech Enthusiast' },
    adminEmail: { type: String, default: 'admin@example.com' },
    maintenanceMode: { type: Boolean, default: false },
    copyrightText: { type: String, default: 'All rights reserved' },
    siteLanguage: { type: String, default: 'en' },
    favicon: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);