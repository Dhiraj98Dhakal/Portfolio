const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

// ========== MODELS ==========
const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Message = require('./models/Message');
const Settings = require('./models/Settings');
const Testimonial = require('./models/Testimonial');

const app = express();
const PORT = process.env.PORT || 3001;

// ========== CORS ==========
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== UPLOADS ==========
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ========== MONGODB ==========
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// ========== MULTER ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ========== AUTH ==========
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ========== TEST ROUTE ==========
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is running!', time: new Date() });
});

// ========== ADMIN LOGIN ==========
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ========== PROFILE API - FIXED ==========
app.get('/api/profile', async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = await Profile.create({
                name: 'Dhiraj Dhakal',
                title: 'BICTE Student | Developer | Tech Enthusiast',
                bio: 'Crafting digital experiences with code and creativity.',
                email: 'dhiraj@example.com',
                phone: '+977 9808704655',
                location: 'Morang, Nepal',
                country: 'Nepal',
                experience: '2+',
                initials: 'D',
                education: 'BICTE (2022 - Present)',
                stats: { projects: '15+', certificates: '8', clients: '10+', years: '2' },
                socialLinks: { github: '', linkedin: '', twitter: '', instagram: '', facebook: '', youtube: '' }
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/profile', authenticateToken, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) profile = new Profile();

        // Update text fields
        const fields = ['name', 'title', 'bio', 'aboutText', 'email', 'phone', 'location', 
                       'country', 'experience', 'initials', 'education', 'cvLink', 'website', 
                       'shortBio', 'contactTitle', 'contactText'];
        fields.forEach(f => { if (req.body[f]) profile[f] = req.body[f]; });

        // Update stats
        if (req.body.stats) {
            try { profile.stats = JSON.parse(req.body.stats); } catch (e) {}
        }

        // Update social links - FIXED
        if (req.body.socialLinks) {
            try {
                const socialLinks = JSON.parse(req.body.socialLinks);
                if (!profile.socialLinks) profile.socialLinks = {};
                Object.assign(profile.socialLinks, socialLinks);
            } catch (e) {}
        }

        // Update images
        if (req.files?.profileImage) profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
        if (req.files?.aboutImage) profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;

        await profile.save();
        res.json({ success: true, message: 'Profile updated', profile });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== PROJECTS API ==========
app.get('/api/projects', async (req, res) => {
    try { res.json(await Project.find().sort('-createdAt')); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            technologies: req.body.technologies?.split(',').map(t => t.trim()) || [],
            github: req.body.github || '',
            demo: req.body.demo || '',
            featured: req.body.featured === 'true',
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Not found' });
        
        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.technologies = req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : project.technologies;
        project.github = req.body.github || project.github;
        project.demo = req.body.demo || project.demo;
        project.featured = req.body.featured === 'true';
        if (req.file) project.image = `/uploads/${req.file.filename}`;
        
        await project.save();
        res.json({ success: true, project });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try { await Project.findByIdAndDelete(req.params.id); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// ========== SKILLS API ==========
app.get('/api/skills', async (req, res) => {
    try { res.json(await Skill.find().sort('-level')); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json({ success: true, skill });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, skill });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try { await Skill.findByIdAndDelete(req.params.id); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// ========== MESSAGES API ==========
app.post('/api/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).json({ success: true, message: 'Message sent' });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try { res.json(await Message.find().sort('-createdAt')); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.get('/api/messages/unread/count', authenticateToken, async (req, res) => {
    try { const count = await Message.countDocuments({ read: false }); res.json({ count }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try { await Message.findByIdAndUpdate(req.params.id, { read: true }); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try { await Message.findByIdAndDelete(req.params.id); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// ========== SETTINGS API ==========
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json(settings);
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        Object.assign(settings, req.body);
        await settings.save();
        res.json({ success: true, settings });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// ========== TESTIMONIALS API ==========
app.get('/api/testimonials', async (req, res) => {
    try { res.json(await Testimonial.find().sort('-createdAt')); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/testimonials', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const testimonial = new Testimonial({
            name: req.body.name,
            position: req.body.position || '',
            company: req.body.company || '',
            content: req.body.content,
            rating: parseInt(req.body.rating) || 5,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await testimonial.save();
        res.status(201).json({ success: true, testimonial });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
    try { await Testimonial.findByIdAndDelete(req.params.id); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// ========== UPLOADS API ==========
app.get('/api/uploads', authenticateToken, (req, res) => {
    fs.readdir(uploadsDir, (err, files) => res.json({ files: err ? [] : files }));
});

app.delete('/api/uploads/:filename', authenticateToken, (req, res) => {
    const filepath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filepath)) { fs.unlinkSync(filepath); res.json({ success: true }); }
    else res.status(404).json({ success: false, message: 'File not found' });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});