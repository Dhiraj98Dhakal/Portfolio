const mongoose = require('mongoose');

/**
 * Testimonial Schema - Client feedback
 * Stores client testimonials with ratings and images
 */
const TestimonialSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Client name is required'],
        trim: true 
    },
    position: { 
        type: String, 
        default: '',
        trim: true 
    },
    company: { 
        type: String, 
        default: '',
        trim: true 
    },
    content: { 
        type: String, 
        required: [true, 'Testimonial content is required'],
        trim: true 
    },
    image: { 
        type: String, 
        default: null 
    },
    rating: { 
        type: Number, 
        default: 5,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    featured: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Indexes
TestimonialSchema.index({ featured: -1, createdAt: -1 });
TestimonialSchema.index({ rating: -1 });

module.exports = mongoose.model('Testimonial', TestimonialSchema);