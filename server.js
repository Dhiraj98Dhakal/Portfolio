// backend/server.js - Complete Backend with MongoDB and Fixed Authentication
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

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|ico/;
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
                bio: "Crafting digital experiences with code and creativity. Building the future, one line at a time.",
                aboutText: "I'm a passionate BICTE student with a strong interest in web development and technology. I love creating beautiful, functional websites and applications that solve real-world problems.",
                email: "dhiraj@example.com",
                phone: "+977 9812345678",
                location: "Kathmandu, Nepal",
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
                socialLinks: new Map([
                    ['github', 'https://github.com'],
                    ['linkedin', 'https://linkedin.com'],
                    ['twitter', 'https://twitter.com'],
                    ['instagram', 'https://instagram.com']
                ])
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
// ADMIN LOGIN - FIXED VERSION
// ============================================
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username });

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Generate token with timestamp
        const token = jwt.sign(
            { 
                username,
                loginTime: Date.now()
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful - Token generated');

        res.json({
            success: true,
            token: token,
            message: 'Login successful'
        });
    } else {
        console.log('❌ Login failed - invalid credentials');
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// ============================================
// PROFILE API
// ============================================
app.get('/api/profile', async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = await Profile.create({});
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/profile', authenticateToken, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'aboutImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (!profile) {
            profile = new Profile();
        }

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

        // Update stats
        if (req.body.stats) {
            try {
                profile.stats = JSON.parse(req.body.stats);
            } catch (e) {
                console.log('Stats parse error:', e);
            }
        }

        // Update social links
        if (req.body.socialLinks) {
            try {
                profile.socialLinks = new Map(Object.entries(JSON.parse(req.body.socialLinks)));
            } catch (e) {
                console.log('Social links parse error:', e);
            }
        }

        // Update profile image
        if (req.files && req.files.profileImage) {
            if (profile.profileImage) {
                const oldImagePath = path.join(uploadsDir, path.basename(profile.profileImage));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            profile.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
        }

        // Update about image
        if (req.files && req.files.aboutImage) {
            if (profile.aboutImage) {
                const oldImagePath = path.join(uploadsDir, path.basename(profile.aboutImage));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            profile.aboutImage = `/uploads/${req.files.aboutImage[0].filename}`;
        }

        await profile.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        res.status(201).json({
            success: true,
            message: 'Project added successfully',
            project: newProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/projects/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project.title = req.body.title || project.title;
        project.description = req.body.description || project.description;
        project.technologies = req.body.technologies ? req.body.technologies.split(',').map(t => t.trim()) : project.technologies;
        project.github = req.body.github || project.github;
        project.demo = req.body.demo || project.demo;
        project.featured = req.body.featured === 'true' ? true : (req.body.featured === 'false' ? false : project.featured);

        if (req.file) {
            if (project.image) {
                const oldImagePath = path.join(uploadsDir, path.basename(project.image));
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            project.image = `/uploads/${req.file.filename}`;
        }

        await project.save();
        res.json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (project.image) {
            const imagePath = path.join(uploadsDir, path.basename(project.image));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
    try {
        const newSkill = new Skill({
            name: req.body.name,
            level: parseInt(req.body.level),
            icon: req.body.icon,
            color: req.body.color || '#4f46e5',
            category: req.body.category || 'general'
        });

        await newSkill.save();
        res.status(201).json({
            success: true,
            skill: newSkill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                level: parseInt(req.body.level),
                icon: req.body.icon,
                color: req.body.color,
                category: req.body.category
            },
            { new: true }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.json({
            success: true,
            skill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.json({
            success: true,
            message: 'Skill deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
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
            message: req.body.message,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent')
        });

        await newMessage.save();
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
        res.json(messages);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// MESSAGES API - VERIFY THESE ROUTES EXIST
// ============================================

// Get all messages (admin only)
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find().sort('-createdAt');
        console.log(`📧 Found ${messages.length} messages`);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get single message
app.get('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get unread count
app.get('/api/messages/unread/count', authenticateToken, async (req, res) => {
    try {
        const count = await Message.countDocuments({ read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Mark message as read
app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Message marked as read' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Delete message
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ 
                success: false, 
                message: 'Message not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Message deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

const Testimonial = require('./models/Testimonial');

// Get all testimonials
app.get('/api/testimonials', async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort('-createdAt');
        res.json(testimonials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add testimonial (admin only)
app.post('/api/testimonials', authenticateToken, async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update testimonial (admin only)
app.put('/api/testimonials/:id', authenticateToken, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete testimonial (admin only)
app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ============================================
// SETTINGS API
// ============================================
app.get('/api/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.put('/api/settings', authenticateToken, upload.single('favicon'), async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.siteTitle = req.body.siteTitle || settings.siteTitle;
        settings.siteDescription = req.body.siteDescription || settings.siteDescription;
        settings.adminEmail = req.body.adminEmail || settings.adminEmail;
        settings.maintenanceMode = req.body.maintenanceMode === 'true';
        settings.copyrightText = req.body.copyrightText || settings.copyrightText;
        settings.siteLanguage = req.body.siteLanguage || settings.siteLanguage;

        if (req.file) {
            if (settings.favicon) {
                const oldFaviconPath = path.join(uploadsDir, path.basename(settings.favicon));
                if (fs.existsSync(oldFaviconPath)) {
                    fs.unlinkSync(oldFaviconPath);
                }
            }
            settings.favicon = `/uploads/${req.file.filename}`;
        }

        await settings.save();
        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// UPLOADS API
// ============================================
app.get('/api/uploads', authenticateToken, (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        res.json({ files });
    });
});

app.delete('/api/uploads/:filename', authenticateToken, (req, res) => {
    const filepath = path.join(uploadsDir, req.params.filename);

    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'File not found'
        });
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
            settings: await Settings.findOne(),
            timestamp: new Date().toISOString()
        };
        res.json(backup);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/restore', authenticateToken, async (req, res) => {
    try {
        const backup = req.body;

        if (!backup.profile || !backup.projects || !backup.skills || !backup.settings) {
            return res.status(400).json({
                success: false,
                message: 'Invalid backup file'
            });
        }

        await Profile.deleteMany({});
        await Profile.create(backup.profile);

        await Project.deleteMany({});
        await Project.insertMany(backup.projects);

        await Skill.deleteMany({});
        await Skill.insertMany(backup.skills);

        await Settings.deleteMany({});
        await Settings.create(backup.settings);

        res.json({
            success: true,
            message: 'Data restored successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
            '/api/uploads',
            '/api/backup',
            '/api/admin/login',
            '/api/test'
        ]
    });
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
        res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    } else {
        res.sendFile(path.join(__dirname, '../404.html'));
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
app.listen(PORT, () => {
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
    console.log(`   Username: ${process.env.ADMIN_USERNAME}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('='.repeat(60) + '\n');
});