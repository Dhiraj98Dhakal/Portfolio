const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, default: '' },
    company: { type: String, default: '' },
    content: { type: String, required: true },
    image: { type: String, default: null },
    rating: { type: Number, default: 5, min: 1, max: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
