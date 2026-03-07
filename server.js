// backend/server.js - FINAL WORKING VERSION
// ALL PROBLEMS SOLVED - SOCIAL LINKS WILL WORK

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ============================================
// MODELS IMPORT
// ============================================
const Profile = require('./models/Profile');
const Project = require('./models/Project');
const Skill = require('./models/Skill');
const Message = require('./models/Message');
const Settings = require('./models/Settings');
const Testimonial = require('./models/Testimonial');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// CORS MIDDLEWARE - COMPLETE FIX
// ============================================
const corsOptions = {
    origin: [
        'https://dhirajdhakal.netlify.app',
        'https://dhirajgg.netlify.app', 
        'https://portfolio-xqwu.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:5500',
        'http://localhost:5500'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// UPLOADS FOLDER SETUP
// ============================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ============================================
// MONGODB CONNECTION
// ============================================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Connected');
    initializeData();
})
.catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
});

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|ico|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only image files are allowed'));
    }
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// ============================================
// INITIALIZE DEFAULT DATA
// ============================================
async function initializeData() {
    try {
        const profileCount = await Profile.countDocuments();
        if (profileCount === 0) {
            await Profile.create({
                name: "Dhiraj Dhakal",
                title: "BICTE Student | Developer | Tech Enthusiast",
                bio: "Crafting digital experiences with code and creativity.",
                email: "dhiraj@example.com",
                phone: "+977 9808704655",
                location: "Morang, Nepal",
                country: "Nepal",
                socialLinks: {
                    github: "",
                    linkedin: "",
                    twitter: "",
                    instagram: "",
                    facebook: "",
                    youtube: ""
                }
            });
        }

        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            await Project.create([
                { title: "Smart Attendance System", description: "QR code based attendance system", technologies: ["React", "Node.js", "MongoDB"], github: "https://github.com", demo: "https://demo.com", featured: true },
                { title: "E-Learning Platform", description: "Online learning platform", technologies: ["Next.js", "Tailwind", "Prisma"], github: "https://github.com", demo: "https://demo.com", featured: true }
            ]);
        }

        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await Settings.create({
                siteTitle: "Dhiraj Dhakal - Portfolio",
                siteDescription: "BICTE Student | Developer | Tech Enthusiast",
                adminEmail: "admin@example.com",
                maintenanceMode: false,
                favicon: null
            });
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// ============================================
// ROOT ROUTE
// ============================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Backend API is running',
        endpoints: {
            test: '/api/test',
            profile: '/api/profile',
            projects: '/api/projects',
            skills: '/api/skills',
            messages: '/api/messages',
            settings: '/api/settings',
            testimonials: '/api/testimonials',
            uploads: '/api/uploads',
            admin_login: '/api/admin/login'
        }
    });
});

// ============================================
// TEST ROUTE
// ============================================
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running!',
        endpoints: [
            '/api/profile', '/api/projects', '/api/skills', '/api/messages',
            '/api/settings', '/api/testimonials', '/api/uploads', '/api/admin/login'
        ]
    });
});

// ============================================
// ADMIN LOGIN
// ============================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ============================================
// PROFILE API - FIXED VERSION (SOCIAL LINKS WILL WORK)
// ============================================
app.get('/api/profile', async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = await Profile.create({
                name: 'Dhiraj Dhakal',
                title: 'BICTE Student | Developer | Tech Enthusiast',
                email: 'dhiraj@example.com',
                socialLinks: {
                    github: '',
                    linkedin: '',
                    twitter: '',
                    instagram: '',
                    facebook: '',
                    youtube: ''
                }
            });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== PUT /api/profile - SIMPLE WORKING VERSION =====
app.put('/api/profile', authenticateToken, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) profile = new Profile();

        // ===== SIMPLE SOCIAL LINKS FIX =====
        if (req.body.socialLinks) {
            try {
                // Get social links - could be string or object
                let links = req.body.socialLinks;
                if (typeof links === 'string') {
                    links = JSON.parse(links);
                }
                
                // DIRECT ASSIGNMENT - NO CONDITIONS
                profile.socialLinks = {
                    github: links.github || '',
                    linkedin: links.linkedin || '',
                    twitter: links.twitter || '',
                    instagram: links.instagram || '',  // THIS WILL WORK
                    facebook: links.facebook || '',
                    youtube: links.youtube || ''
                };
                
                console.log('✅ Instagram saved:', profile.socialLinks.instagram);
                profile.markModified('socialLinks');
            } catch (e) {
                console.error('Social links error:', e);
            }
        }

        // Update other fields
        const fields = ['name', 'title', 'bio', 'email', 'phone', 'location', 'country', 'experience', 'initials'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) profile[field] = req.body[field];
        });

        // Handle images
        if (req.files) {
            if (req.files.profileImage) profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
            if (req.files.aboutImage) profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;
        }

        await profile.save();
        
        // Return updated profile
        res.json({ 
            success: true, 
            profile: profile,
            message: 'Profile updated successfully'
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// PROJECTS API
// ============================================
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort('-createdAt');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = new Project({
            title: req.body.title,
            description: req.body.description,
            technologies: req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : [],
            github: req.body.github || '',
            demo: req.body.demo || '',
            image: req.file ? `/uploads/${req.file.filename}` : null,
            featured: req.body.featured === 'true'
        });
        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SKILLS API
// ============================================
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort('-level');
        res.json(skills);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json({ success: true, skill });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// MESSAGES API
// ============================================
app.post('/api/messages', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/messages/unread/count', authenticateToken, async (req, res) => {
    try {
        const count = await Message.countDocuments({ read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SETTINGS API
// ============================================
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/settings', authenticateToken, upload.single('favicon'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        if (req.body.siteTitle) settings.siteTitle = req.body.siteTitle;
        if (req.body.siteDescription) settings.siteDescription = req.body.siteDescription;
        if (req.body.adminEmail) settings.adminEmail = req.body.adminEmail;
        if (req.body.maintenanceMode) settings.maintenanceMode = req.body.maintenanceMode === 'true';
        if (req.file) settings.favicon = `/uploads/${req.file.filename}`;
        
        await settings.save();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// TESTIMONIALS API
// ============================================
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort('-createdAt');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
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
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// UPLOADS API
// ============================================
app.get('/api/uploads', authenticateToken, (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ files });
    });
});

app.delete('/api/uploads/:filename', authenticateToken, (req, res) => {
    const filepath = path.join(uploadsDir, req.params.filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});

// ============================================
// SERVE STATIC FILES
// ============================================
app.use(express.static(path.join(__dirname, '..')));

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ success: false, message: 'API endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, '../404.html'));
    }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Server running on port ${PORT}`);
    console.log(`📍 URL: https://portfolio-xqwu.onrender.com`);
    console.log(`📍 Test API: https://portfolio-xqwu.onrender.com/api/test\n`);
});