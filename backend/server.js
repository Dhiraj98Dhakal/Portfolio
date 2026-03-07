const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Message = require('./models/Message');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user; next();
    });
};

// Routes
app.get('/', (req, res) => res.json({ success: true, message: 'Backend API running' }));
app.get('/api/test', (req, res) => res.json({ success: true, message: 'Server OK' }));




// ============================================
// TESTIMONIALS API - ADD THESE ROUTES
// ============================================

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort('-createdAt');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single testimonial
app.get('/api/testimonials/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.json(testimonial);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add testimonial (admin only)
app.post('/api/testimonials', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const testimonialData = {
            name: req.body.name,
            position: req.body.position || '',
            company: req.body.company || '',
            content: req.body.content,
            rating: parseInt(req.body.rating) || 5,
            image: req.file ? `/uploads/${req.file.filename}` : null
        };
        
        const testimonial = new Testimonial(testimonialData);
        await testimonial.save();
        res.status(201).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update testimonial (admin only)
app.put('/api/testimonials/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        
        testimonial.name = req.body.name || testimonial.name;
        testimonial.position = req.body.position || testimonial.position;
        testimonial.company = req.body.company || testimonial.company;
        testimonial.content = req.body.content || testimonial.content;
        testimonial.rating = parseInt(req.body.rating) || testimonial.rating;
        
        if (req.file) {
            testimonial.image = `/uploads/${req.file.filename}`;
        }
        
        await testimonial.save();
        res.json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete testimonial (admin only)
app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});




// Admin Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Profile
app.get('/api/profile', async (req, res) => {
    let profile = await Profile.findOne();
    if (!profile) profile = await Profile.create({});
    res.json(profile);
});

app.put('/api/profile', authenticateToken, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 }
]), async (req, res) => {
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();
    
    const fields = ['name','title','bio','aboutText','email','phone','location','country','experience','initials','education'];
    fields.forEach(f => { if (req.body[f]) profile[f] = req.body[f]; });
    
    if (req.body.socialLinks) profile.socialLinks = JSON.parse(req.body.socialLinks);
    if (req.files?.profileImage) profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    if (req.files?.aboutImage) profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;
    
    await profile.save();
    res.json({ success: true, profile });
});

// Projects
app.get('/api/projects', async (req, res) => res.json(await Project.find().sort('-createdAt')));
app.get('/api/projects/:id', async (req, res) => {
    const p = await Project.findById(req.params.id);
    p ? res.json(p) : res.status(404).json({ success: false });
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    const project = new Project({
        title: req.body.title,
        description: req.body.description,
        technologies: req.body.technologies?.split(',').map(t => t.trim()) || [],
        github: req.body.github,
        demo: req.body.demo,
        featured: req.body.featured === 'true',
        image: req.file ? `/uploads/${req.file.filename}` : null
    });
    await project.save();
    res.status(201).json({ success: true, project });
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false });
    
    project.title = req.body.title || project.title;
    project.description = req.body.description || project.description;
    project.technologies = req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : project.technologies;
    project.github = req.body.github || project.github;
    project.demo = req.body.demo || project.demo;
    project.featured = req.body.featured === 'true';
    if (req.file) project.image = `/uploads/${req.file.filename}`;
    
    await project.save();
    res.json({ success: true, project });
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Skills
app.get('/api/skills', async (req, res) => res.json(await Skill.find().sort('-level')));
app.post('/api/skills', authenticateToken, async (req, res) => {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json({ success: true, skill });
});
app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, skill });
});
app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Messages
app.post('/api/messages', async (req, res) => {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json({ success: true, message: 'Message sent' });
});
app.get('/api/messages', authenticateToken, async (req, res) => res.json(await Message.find().sort('-createdAt')));
app.get('/api/messages/unread/count', authenticateToken, async (req, res) => {
    const count = await Message.countDocuments({ read: false });
    res.json({ count });
});
app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
});
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// Settings
app.get('/api/settings', async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
});
app.put('/api/settings', authenticateToken, async (req, res) => {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, settings });
});

// Uploads
app.get('/api/uploads', authenticateToken, (req, res) => {
    fs.readdir(uploadsDir, (err, files) => res.json({ files: err ? [] : files }));
});
app.delete('/api/uploads/:filename', authenticateToken, (req, res) => {
    const filepath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); res.json({ success: true }); }
    else res.status(404).json({ success: false, message: 'File not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 ${PORT}`);
});