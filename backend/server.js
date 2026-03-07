// backend/server.js - Complete Backend with MongoDB and All Features
// Run with: npm run dev

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
// CORS MIDDLEWARE - COMPLETE FIX FOR NETLIFY & RENDER
// ============================================
const corsOptions = {
    origin: [
        'https://dhirajdhakal.netlify.app',
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

// Body parser middleware
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
console.log('\n' + '='.repeat(60));
console.log('🔄 Connecting to MongoDB...');
console.log('='.repeat(60));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ MONGODB CONNECTED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`📍 Database: ${mongoose.connection.name}`);
        console.log(`📍 Host: ${mongoose.connection.host}`);
        console.log('='.repeat(60) + '\n');
        initializeData();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.log('\n💡 Tips:');
        console.log('1. Check your password in .env file');
        console.log('2. Make sure MongoDB Atlas IP whitelist has 0.0.0.0/0');
        console.log('3. Check your network connection\n');
        process.exit(1);
    });

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
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

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// ============================================
// INITIALIZE DEFAULT DATA
// ============================================
async function initializeData() {
    try {
        // Profile
        const profileCount = await Profile.countDocuments();
        if (profileCount === 0) {
            await Profile.create({
                name: "Dhiraj Dhakal",
                title: "BICTE Student | Developer | Tech Enthusiast",
                bio: "Crafting digital experiences with code and creativity.",
                aboutText: "BICTE student passionate about web development.",
                email: "dhiraj@example.com",
                phone: "+977 9808704655",
                location: "Morang, Nepal",
                country: "Nepal",
                experience: "2+",
                initials: "D",
                education: "BICTE (2022 - Present)",
                profileImage: null,
                aboutImage: null,
                cvLink: "#",
                website: "www.dhiraj.com.np",
                shortBio: "Creating digital experiences that make a difference.",
                contactTitle: "Let's work together",
                contactText: "I'm always interested in hearing about new opportunities.",
                stats: {
                    projects: "15+",
                    certificates: "8",
                    clients: "10+",
                    years: "2"
                },
                socialLinks: {
                    github: "",
                    linkedin: "",
                    twitter: "",
                    instagram: "",
                    facebook: "",
                    youtube: ""
                }
            });
            console.log('✅ Created default profile');
        }

        // Projects
        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            await Project.create([
                {
                    title: "Smart Attendance System",
                    description: "QR code based attendance system for college students with real-time tracking.",
                    technologies: ["React", "Node.js", "MongoDB", "QR Code"],
                    github: "https://github.com",
                    demo: "https://demo.com",
                    featured: true
                },
                {
                    title: "E-Learning Platform",
                    description: "Modern online learning platform with video courses, quizzes, and progress tracking.",
                    technologies: ["Next.js", "Tailwind CSS", "Prisma", "PostgreSQL"],
                    github: "https://github.com",
                    demo: "https://demo.com",
                    featured: true
                },
                {
                    title: "Weather App",
                    description: "Real-time weather application with beautiful animations and 7-day forecast.",
                    technologies: ["React", "OpenWeather API", "Chart.js"],
                    github: "https://github.com",
                    demo: "https://demo.com",
                    featured: false
                }
            ]);
            console.log('✅ Created default projects');
        }

        // Skills
        const skillCount = await Skill.countDocuments();
        if (skillCount === 0) {
            await Skill.create([
                { name: "HTML5", level: 95, icon: "fab fa-html5", color: "#E34F26", category: "frontend" },
                { name: "CSS3", level: 92, icon: "fab fa-css3-alt", color: "#1572B6", category: "frontend" },
                { name: "JavaScript", level: 88, icon: "fab fa-js", color: "#F7DF1E", category: "frontend" },
                { name: "React", level: 85, icon: "fab fa-react", color: "#61DAFB", category: "frontend" },
                { name: "Node.js", level: 78, icon: "fab fa-node", color: "#339933", category: "backend" },
                { name: "PHP", level: 70, icon: "fab fa-php", color: "#777BB4", category: "backend" },
                { name: "MySQL", level: 75, icon: "fas fa-database", color: "#4479A1", category: "database" },
                { name: "Git", level: 85, icon: "fab fa-git-alt", color: "#F05032", category: "tools" }
            ]);
            console.log('✅ Created default skills');
        }

        // Settings
        const settingsCount = await Settings.countDocuments();
        if (settingsCount === 0) {
            await Settings.create({
                siteTitle: "Dhiraj Dhakal - Portfolio",
                siteDescription: "BICTE Student | Developer | Tech Enthusiast",
                adminEmail: "admin@example.com",
                maintenanceMode: false,
                copyrightText: "All rights reserved",
                siteLanguage: "en",
                favicon: null
            });
            console.log('✅ Created default settings');
        }

        console.log('✅ All default data initialized\n');
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
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        endpoints: {
            test: '/api/test',
            profile: '/api/profile',
            projects: '/api/projects',
            skills: '/api/skills',
            messages: '/api/messages',
            settings: '/api/settings',
            testimonials: '/api/testimonials',
            uploads: '/api/uploads',
            backup: '/api/backup',
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
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        endpoints: [
            '/api/profile',
            '/api/projects',
            '/api/skills',
            '/api/messages',
            '/api/settings',
            '/api/testimonials',
            '/api/uploads',
            '/api/backup',
            '/api/admin/login',
            '/api/test'
        ]
    });
});

// ============================================
// ADMIN LOGIN
// ============================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username });

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign(
            { username, loginTime: Date.now() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful');
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        console.log('❌ Login failed');
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// ============================================
// PROFILE API
// ============================================

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
                socialLinks: {
                    github: 'https://github.com',
                    linkedin: 'https://linkedin.com',
                    twitter: 'https://twitter.com',
                    instagram: 'https://instagram.com',
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

// ===== PUT /api/profile - COMPLETE FIXED VERSION =====
app.put('/api/profile', authenticateToken, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = new Profile();
        }

        console.log('\n' + '='.repeat(60));
        console.log('📥 PROFILE UPDATE REQUEST');
        console.log('='.repeat(60));
        console.log('Body fields:', Object.keys(req.body));
        
        // Update text fields
        const textFields = [
            'name', 'title', 'bio', 'aboutText', 'email', 'phone',
            'location', 'country', 'experience', 'initials', 'education',
            'cvLink', 'website', 'shortBio', 'contactTitle', 'contactText'
        ];

        textFields.forEach(field => {
            if (req.body[field] !== undefined) {
                profile[field] = req.body[field];
            }
        });

       // ===== SOCIAL LINKS - ULTIMATE FIX =====
if (req.body.socialLinks) {
    try {
        console.log('\n📤 SOCIAL LINKS PROCESSING:');
        
        // Get socialLinks - यो object नै हुनुपर्छ
        let socialLinks = req.body.socialLinks;
        console.log('Raw socialLinks:', socialLinks);
        
        // If it's a string, parse it
        if (typeof socialLinks === 'string') {
            socialLinks = JSON.parse(socialLinks);
        }
        
        // Make sure profile.socialLinks exists
        if (!profile.socialLinks) {
            profile.socialLinks = {};
        }
        
        // CRITICAL: Instagram value check
        console.log('Instagram received:', socialLinks.instagram);
        
        // Update EACH social link individually
        profile.socialLinks.github = socialLinks.github || '';
        profile.socialLinks.linkedin = socialLinks.linkedin || '';
        profile.socialLinks.twitter = socialLinks.twitter || '';
        profile.socialLinks.instagram = socialLinks.instagram || ''; // ← यो लाइन सबैभन्दा महत्त्वपूर्ण
        profile.socialLinks.facebook = socialLinks.facebook || '';
        profile.socialLinks.youtube = socialLinks.youtube || '';
        
        console.log('Final socialLinks in profile:', profile.socialLinks);
        
        // Mark as modified
        profile.markModified('socialLinks');
        
    } catch (e) {
        console.error('❌ SOCIAL LINKS ERROR:', e);
    }
}

        // Update images
        if (req.files) {
            if (req.files.profileImage) {
                profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
                console.log('📸 Profile image updated');
            }
            if (req.files.aboutImage) {
                profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;
                console.log('📸 About image updated');
            }
        }

        // Save to database
        console.log('\n💾 SAVING TO DATABASE...');
        const savedProfile = await profile.save();
        
        console.log('✅ SAVED PROFILE SOCIAL LINKS:', savedProfile.socialLinks);
        console.log('✅ Instagram in DB:', savedProfile.socialLinks.instagram);
        console.log('='.repeat(60) + '\n');
        
        // Return the updated profile
      // Return the updated profile
res.json(savedProfile);
        
    } catch (error) {
        console.error('❌ PROFILE UPDATE ERROR:', error);
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
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/projects', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const newProject = new Project({
            title: req.body.title,
            description: req.body.description,
            technologies: req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : [],
            github: req.body.github || '',
            demo: req.body.demo || '',
            image: req.file ? `/uploads/${req.file.filename}` : null,
            featured: req.body.featured === 'true'
        });

        await newProject.save();
        res.status(201).json({ success: true, message: 'Project added successfully', project: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.technologies = req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : project.technologies;
        project.github = req.body.github || project.github;
        project.demo = req.body.demo || project.demo;
        project.featured = req.body.featured === 'true';

        if (req.file) {
            project.image = `/uploads/${req.file.filename}`;
        }

        await project.save();
        res.json({ success: true, message: 'Project updated successfully', project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Project deleted successfully' });
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
        const newSkill = new Skill(req.body);
        await newSkill.save();
        res.status(201).json({ success: true, skill: newSkill });
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
        const newMessage = new Message({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject || 'No Subject',
            message: req.body.message
        });
        await newMessage.save();
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
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
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json({ success: true, message });
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
// SETTINGS API - FIXED VERSION
// ============================================

app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({
                siteTitle: 'Dhiraj Dhakal - Portfolio',
                siteDescription: 'BICTE Student | Developer | Tech Enthusiast',
                adminEmail: 'admin@example.com',
                maintenanceMode: false,
                copyrightText: 'All rights reserved',
                siteLanguage: 'en',
                favicon: null
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/settings', authenticateToken, upload.single('favicon'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        
        // Update text fields
        if (req.body.siteTitle) settings.siteTitle = req.body.siteTitle;
        if (req.body.siteDescription) settings.siteDescription = req.body.siteDescription;
        if (req.body.adminEmail) settings.adminEmail = req.body.adminEmail;
        if (req.body.copyrightText) settings.copyrightText = req.body.copyrightText;
        if (req.body.siteLanguage) settings.siteLanguage = req.body.siteLanguage;
        
        // Update boolean
        settings.maintenanceMode = req.body.maintenanceMode === 'true';
        
        // Update favicon
        if (req.file) {
            settings.favicon = `/uploads/${req.file.filename}`;
            console.log('✅ Favicon updated:', settings.favicon);
        }
        
        await settings.save();
        console.log('✅ Settings saved');
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('❌ Settings update error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// TESTIMONIALS API
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

// Update testimonial
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

// Delete testimonial
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
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
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
        const frontend404Path = path.join(__dirname, '../404.html');
        if (fs.existsSync(frontend404Path)) {
            res.sendFile(frontend404Path);
        } else {
            res.status(404).json({ success: false, message: 'Route not found' });
        }
    }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        success: false, 
        message: err.message || 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SERVER STARTED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`📍 PORT: ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
    console.log('='.repeat(60));
    console.log(`📁 Uploads Directory: ${uploadsDir}`);
    console.log('='.repeat(60));
    console.log('🔐 Admin Login:');
    console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('='.repeat(60) + '\n');
});