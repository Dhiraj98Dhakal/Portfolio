const mongoose = require('mongoose');

/**
 * Settings Schema - Site configuration
 * Stores global site settings and configuration
 */
const SettingsSchema = new mongoose.Schema({
    siteTitle: { 
        type: String, 
        default: 'Dhiraj Dhakal - Portfolio' 
    },
    siteDescription: { 
        type: String, 
        default: 'BICTE Student | Developer | Tech Enthusiast' 
    },
    adminEmail: { 
        type: String, 
        default: 'admin@example.com' 
    },
    maintenanceMode: { 
        type: Boolean, 
        default: false 
    },
    copyrightText: { 
        type: String, 
        default: 'All rights reserved' 
    },
    siteLanguage: { 
        type: String, 
        default: 'en',
        enum: ['en', 'ne', 'hi'] // English, Nepali, Hindi
    },
    favicon: { 
        type: String, 
        default: null 
    },
    
    // SEO Settings
    metaKeywords: { 
        type: String, 
        default: 'portfolio, developer, nepal, web development' 
    },
    googleAnalyticsId: { 
        type: String, 
        default: '' 
    }
}, { 
    timestamps: true 
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function() {
    const settings = await this.findOne();
    if (settings) return settings;
    return this.create({});
};

module.exports = mongoose.model('Settings', SettingsSchema);