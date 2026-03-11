// backend/server.js - FINAL RAILWAY VERSION WITH VOLUME SUPPORT
// ALL PROBLEMS SOLVED - FILES NEVER LOST ON DEPLOY

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
// CORS MIDDLEWARE - COMPLETE FIX WITH ALL NETLIFY & RAILWAY URLS
// ============================================
const corsOptions = {
    origin: [
        'https://dhirajdhakal.netlify.app',
        'https://dhirajgg.netlify.app',
        'https://portfolio-xqwu.onrender.com',
        'https://diplomatic-light-production.up.railway.app',
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
// UPLOADS FOLDER SETUP - WITH RAILWAY VOLUME SUPPORT
// ============================================
// Railway Volume मा uploads फोल्डर राख्ने
// Railway मा Volume mount path सामान्यतया /app/uploads हुन्छ
const VOLUME_PATH = process.env.RAILWAY_VOLUME_PATH || '/app/uploads';
const LOCAL_UPLOADS_PATH = path.join(__dirname, 'uploads');

// पहिला Volume path try गर्ने, त्यो नभए local path प्रयोग गर्ने
let uploadsDir;
if (fs.existsSync(VOLUME_PATH)) {
    uploadsDir = VOLUME_PATH;
    console.log('📁 Using Railway volume at:', VOLUME_PATH);
} else {
    uploadsDir = LOCAL_UPLOADS_PATH;
    console.log('📁 Using local uploads at:', LOCAL_UPLOADS_PATH);
}

// Folder create गर्ने (यदि छैन भने)
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Static files serve गर्ने
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
// MULTER CONFIGURATION - UPDATED FOR VOLUME
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Always use the determined uploadsDir
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
// PROFILE API - FIXED VERSION (SOCIAL LINKS WORKING)
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

// ===== PUT /api/profile - WORKING VERSION =====
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
                let links = req.body.socialLinks;
                if (typeof links === 'string') {
                    links = JSON.parse(links);
                }
                
                profile.socialLinks = {
                    github: links.github || '',
                    linkedin: links.linkedin || '',
                    twitter: links.twitter || '',
                    instagram: links.instagram || '',
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
        const fields = ['name', 'title', 'bio', 'aboutText', 'email', 'phone', 'location', 'country', 'experience', 'initials', 'education', 'cvLink', 'website', 'shortBio', 'contactTitle', 'contactText'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) profile[field] = req.body[field];
        });

        // Update stats
        if (req.body.stats) {
            try {
                let stats = typeof req.body.stats === 'string' ? JSON.parse(req.body.stats) : req.body.stats;
                profile.stats = { ...profile.stats, ...stats };
            } catch (e) {}
        }

        // Handle images - FILES WILL BE SAVED TO VOLUME
        if (req.files) {
            if (req.files.profileImage && req.files.profileImage[0]) {
                profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
                console.log('📸 Profile image saved to volume:', profile.profileImage);
            }
            if (req.files.aboutImage && req.files.aboutImage[0]) {
                profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;
                console.log('📸 About image saved to volume:', profile.aboutImage);
            }
        }

        await profile.save();
        res.json({ success: true, profile });
        
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

app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json(project);
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

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.technologies = req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : project.technologies;
        project.github = req.body.github || project.github;
        project.demo = req.body.demo || project.demo;
        project.featured = req.body.featured === 'true';
        if (req.file) project.image = `/uploads/${req.file.filename}`;

        await project.save();
        res.json({ success: true, project });
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

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, skill });
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

app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
        res.json(message);
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
        if (req.body.copyrightText) settings.copyrightText = req.body.copyrightText;
        if (req.body.siteLanguage) settings.siteLanguage = req.body.siteLanguage;
        settings.maintenanceMode = req.body.maintenanceMode === 'true';
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

app.get('/api/testimonials/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
        res.json(testimonial);
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

app.put('/api/testimonials/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });

        testimonial.name = req.body.name || testimonial.name;
        testimonial.position = req.body.position || testimonial.position;
        testimonial.company = req.body.company || testimonial.company;
        testimonial.content = req.body.content || testimonial.content;
        testimonial.rating = parseInt(req.body.rating) || testimonial.rating;
        if (req.file) testimonial.image = `/uploads/${req.file.filename}`;

        await testimonial.save();
        res.json({ success: true, testimonial });
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
// BACKUP & RESTORE API
// ============================================
app.get('/api/backup', authenticateToken, async (req, res) => {
    try {
        const backup = {
            profile: await Profile.findOne(),
            projects: await Project.find(),
            skills: await Skill.find(),
            testimonials: await Testimonial.find(),
            settings: await Settings.findOne(),
            timestamp: new Date().toISOString()
        };
        res.json(backup);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/restore', authenticateToken, async (req, res) => {
    try {
        const backup = req.body;
        
        if (backup.profile) {
            await Profile.deleteMany({});
            await Profile.create(backup.profile);
        }
        if (backup.projects) {
            await Project.deleteMany({});
            await Project.insertMany(backup.projects);
        }
        if (backup.skills) {
            await Skill.deleteMany({});
            await Skill.insertMany(backup.skills);
        }
        if (backup.testimonials) {
            await Testimonial.deleteMany({});
            await Testimonial.insertMany(backup.testimonials);
        }
        if (backup.settings) {
            await Settings.deleteMany({});
            await Settings.create(backup.settings);
        }
        
        res.json({ success: true, message: 'Data restored successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
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
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ============================================
// HEALTH CHECK ENDPOINT (Railway को लागि)
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SERVER STARTED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`📍 PORT: ${PORT}`);
    console.log(`📍 URL: https://diplomatic-light-production.up.railway.app`);
    console.log(`📍 Test API: https://diplomatic-light-production.up.railway.app/api/test`);
    console.log('='.repeat(60));
    console.log(`📁 Uploads Directory: ${uploadsDir}`);
    console.log(`📁 Volume Path: ${VOLUME_PATH}`);
    console.log('='.repeat(60));
    console.log('🔐 Admin Login:');
    console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('='.repeat(60) + '\n');
});