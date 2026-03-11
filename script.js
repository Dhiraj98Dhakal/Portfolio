// ============================================
// script.js - Complete Dynamic Frontend
// ============================================

// Railway Backend URL
const API_URL = 'https://diplomatic-light-production.up.railway.app/api';
const BASE_URL = 'https://diplomatic-light-production.up.railway.app';
const REFRESH_INTERVAL = 30000; // 30 seconds

console.log('✅ Frontend JS Loaded');
console.log('📍 API URL:', API_URL);

// ========== LOAD ALL DATA ==========
async function loadAllData() {
    try {
        console.log('🔄 Loading data from backend...');
        
        // Load profile data
        const profileRes = await fetch(`${API_URL}/profile`);
        if (!profileRes.ok) throw new Error('Profile fetch failed');
        const profile = await profileRes.json();
        console.log('📥 Profile data received:', profile);
        updateProfile(profile);

        // Load skills data
        const skillsRes = await fetch(`${API_URL}/skills`);
        if (!skillsRes.ok) throw new Error('Skills fetch failed');
        const skills = await skillsRes.json();
        updateSkills(skills);

        // Load projects data
        const projectsRes = await fetch(`${API_URL}/projects`);
        if (!projectsRes.ok) throw new Error('Projects fetch failed');
        const projects = await projectsRes.json();
        updateProjects(projects);

        // Load testimonials data
        try {
            const testimonialsRes = await fetch(`${API_URL}/testimonials`);
            if (testimonialsRes.ok) {
                const testimonials = await testimonialsRes.json();
                updateTestimonials(testimonials);
            } else {
                console.log('Testimonials endpoint not available');
                const container = document.getElementById('testimonials-container');
                if (container) container.innerHTML = '<p class="no-data">No testimonials yet</p>';
            }
        } catch (error) {
            console.log('Testimonials not available:', error.message);
        }

        console.log('✅ All data loaded at', new Date().toLocaleTimeString());
    } catch (error) {
        console.log('❌ Backend not connected, using default data:', error.message);
        loadDefaultData();
    }
}

// ========== UPDATE PROFILE - FIXED IMAGE HANDLING ==========
function updateProfile(profile) {
    console.log('📝 Updating profile with:', profile);
    console.log('📝 About Text from profile:', profile.aboutText);
    console.log('📸 Profile image from API:', profile.profileImage);

    // Update all text elements with data-profile attribute
    document.querySelectorAll('[data-profile]').forEach(el => {
        const key = el.getAttribute('data-profile');
        
        if (profile[key]) {
            console.log(`🔍 Found element with data-profile="${key}"`);
            
            if (el.tagName === 'IMG') {
                // ===== IMAGE HANDLING - FIXED VERSION =====
                let imageUrl = null;
                
                // Construct proper image URL
                if (profile[key]) {
                    if (profile[key].startsWith('http')) {
                        // Full URL already
                        imageUrl = profile[key];
                    } else if (profile[key].startsWith('/uploads/')) {
                        // Starts with /uploads/
                        imageUrl = `${BASE_URL}${profile[key]}`;
                    } else {
                        // Just filename
                        imageUrl = `${BASE_URL}/uploads/${profile[key]}`;
                    }
                }
                
                if (imageUrl) {
                    console.log(`🖼️ Setting ${key} image URL:`, imageUrl);
                    
                    // Test if image loads
                    const img = new Image();
                    img.onload = () => {
                        el.src = imageUrl;
                        el.style.display = 'block';
                        console.log(`✅ ${key} image loaded successfully`);
                    };
                    img.onerror = () => {
                        console.error(`❌ Failed to load ${key} image:`, imageUrl);
                        // Fallback to local image
                        if (key === 'profileImage') {
                            el.src = 'images/profile.jpg';
                        } else if (key === 'aboutImage') {
                            el.src = 'images/about.jpg';
                        }
                        el.style.display = 'block';
                    };
                    img.src = imageUrl;
                } else {
                    console.log(`⚠️ No image for ${key}, using fallback`);
                    if (key === 'profileImage') {
                        el.src = 'images/profile.jpg';
                    } else if (key === 'aboutImage') {
                        el.src = 'images/about.jpg';
                    }
                }
                
            } else if (el.tagName === 'A' && key.includes('email')) {
                // Handle email links
                el.href = `mailto:${profile[key]}`;
                el.textContent = profile[key];
            } else if (el.tagName === 'A' && key.includes('phone')) {
                // Handle phone links
                el.href = `tel:${profile[key]}`;
                el.textContent = profile[key];
            } else {
                // Handle text elements
                const oldText = el.textContent;
                el.textContent = profile[key];
                console.log(`✅ Updated ${key}: "${oldText}" -> "${profile[key]}"`);
            }
        } else {
            console.log(`⚠️ No value in profile for data-profile="${key}"`);
        }
    });

    // ========== SOCIAL LINKS UPDATE ==========
    if (profile.socialLinks) {
        console.log('🔗 Updating social links with:', profile.socialLinks);
        
        // Update all elements with data-social attribute
        document.querySelectorAll('[data-social]').forEach(el => {
            const platform = el.getAttribute('data-social');
            const url = profile.socialLinks[platform];
            
            if (url && url.trim() !== '') {
                // Set href and attributes for clickable links
                el.href = url;
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener noreferrer');
                
                // Make sure it's visible and clickable
                el.style.display = 'inline-flex';
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';
                el.style.opacity = '1';
                
                console.log(`✅ Set ${platform} to:`, url);
            } else {
                // Hide if no URL
                el.style.display = 'none';
                console.log(`❌ Hidden ${platform} - no URL`);
            }
        });
    }

    // ========== UPDATE STATS ==========
    if (profile.stats) {
        console.log('📊 Updating stats with:', profile.stats);
        document.querySelectorAll('[data-stat]').forEach(el => {
            const key = el.getAttribute('data-stat');
            if (profile.stats[key]) {
                el.textContent = profile.stats[key];
            }
        });
    }

    // Update document title
    if (profile.name) {
        document.title = `${profile.name} - Portfolio`;
    }
}

// ========== UPDATE TESTIMONIALS ==========
function updateTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) {
        console.log('Testimonials container not found');
        return;
    }

    if (!testimonials || testimonials.length === 0) {
        container.innerHTML = '<p class="no-data">No testimonials yet</p>';
        return;
    }

    console.log('📝 Updating testimonials:', testimonials.length);

    container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <i class="fas fa-quote-left"></i>
                <p>${t.content}</p>
            </div>
            <div class="testimonial-author">
                ${t.image ? `<img src="${t.image.startsWith('http') ? t.image : BASE_URL + t.image}" alt="${t.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60/12121a/00f3ff?text=${t.name.charAt(0)}'">` : ''}
                <div class="author-info">
                    <h4>${t.name}</h4>
                    <p>${t.position || ''} ${t.company ? `@ ${t.company}` : ''}</p>
                    <div class="rating">${'⭐'.repeat(t.rating || 5)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== UPDATE SKILLS ==========
function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) {
        console.log('Skills container not found');
        return;
    }

    if (!skills || skills.length === 0) {
        container.innerHTML = '<p class="no-data">No skills added yet</p>';
        return;
    }

    console.log('📝 Updating skills:', skills.length);

    container.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <div class="skill-header">
                <i class="${skill.icon}" style="color: ${skill.color || '#00f3ff'}"></i>
                <h3>${skill.name}</h3>
            </div>
            <div class="skill-progress">
                <div class="skill-progress-bar" style="width: ${skill.level}%"></div>
            </div>
            <span class="skill-percentage">${skill.level}%</span>
        </div>
    `).join('');
}

// ========== UPDATE PROJECTS ==========
function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) {
        console.log('Projects container not found');
        return;
    }

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No projects added yet</p>';
        return;
    }

    console.log('📝 Updating projects:', projects.length);

    container.innerHTML = projects.map(project => {
        const imageUrl = project.image?.startsWith('http') 
            ? project.image 
            : project.image ? `${BASE_URL}${project.image}` : null;
        
        return `
        <div class="project-card ${project.featured ? 'featured' : ''}">
            <div class="project-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${project.title}" 
                         onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\'width:100%;height:100%;background:linear-gradient(135deg,#00f3ff,#ff00c8);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;\'>${project.title.substring(0,2)}</div>'">` 
                    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#00f3ff,#ff00c8);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;">${project.title.substring(0,2)}</div>`
                }
                ${project.featured ? '<span class="featured-badge">★ Featured</span>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description.substring(0, 100)}...</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                            <i class="fab fa-github"></i> Code
                        </a>
                    ` : ''}
                    ${project.demo ? `
                        <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link">
                            <i class="fas fa-external-link-alt"></i> Live
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    
    initProjectFilters();
}

// ========== PROJECT FILTERS ==========
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'featured') {
                    card.style.display = card.classList.contains('featured') ? 'block' : 'none';
                }
            });
        });
    });
}

// ========== FAVICON SETUP ==========
function setFavicon(iconUrl) {
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.remove());
    
    if (iconUrl && iconUrl !== 'null') {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = iconUrl;
        document.head.appendChild(link);
        
        const appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        appleLink.href = iconUrl;
        document.head.appendChild(appleLink);
        
        console.log('✅ Favicon set to:', iconUrl);
    } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = 'icons/favicon.png';
        document.head.appendChild(link);
        console.log('✅ Using default favicon');
    }
}

async function loadFavicon() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error('Settings fetch failed');
        const settings = await response.json();
        
        if (settings && settings.favicon) {
            setFavicon(`${BASE_URL}${settings.favicon}`);
        } else {
            setFavicon('icons/favicon.png');
        }
    } catch (error) {
        console.log('Using default favicon:', error.message);
        setFavicon('icons/favicon.png');
    }
}

// ========== CONTACT FORM ==========
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        subject: document.getElementById('subject')?.value || 'No Subject',
        message: document.getElementById('message')?.value
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Message sent successfully!');
            e.target.reset();
        } else {
            alert('❌ Error sending message');
        }
    } catch (error) {
        alert('❌ Error sending message: ' + error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== DEFAULT DATA ==========
function loadDefaultData() {
    console.log('📝 Loading default data');
    
    // Default profile data
    updateProfile({
        name: 'Dhiraj Dhakal',
        initials: 'D',
        badge: 'BICTE Student',
        bio: 'Crafting digital experiences with code and creativity.',
        aboutText: 'BICTE student passionate about web development.',
        email: 'dhiraj@example.com',
        phone: '+977 9808704655',
        location: 'Morang, Nepal',
        country: 'Nepal',
        education: 'BICTE (2022 - Present)',
        experience: '2+',
        contactTitle: "Let's work together",
        contactText: "I'm always interested in hearing about new opportunities.",
        stats: {
            projects: '15+',
            certificates: '8',
            clients: '10+',
            years: '2'
        },
        socialLinks: {
            github: 'https://github.com',
            linkedin: 'https://linkedin.com',
            twitter: 'https://twitter.com',
            instagram: 'https://instagram.com',
            facebook: '',
            youtube: ''
        }
    });

    // Default skills
    updateSkills([
        { name: 'HTML5', level: 95, icon: 'fab fa-html5', color: '#E34F26' },
        { name: 'CSS3', level: 92, icon: 'fab fa-css3-alt', color: '#1572B6' },
        { name: 'JavaScript', level: 88, icon: 'fab fa-js', color: '#F7DF1E' },
        { name: 'React', level: 85, icon: 'fab fa-react', color: '#61DAFB' },
        { name: 'Node.js', level: 78, icon: 'fab fa-node', color: '#339933' }
    ]);

    // Default projects
    updateProjects([
        {
            title: 'Smart Attendance System',
            description: 'QR code based attendance system for college students with real-time tracking.',
            technologies: ['React', 'Node.js', 'MongoDB'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        },
        {
            title: 'E-Learning Platform',
            description: 'Modern online learning platform with video courses, quizzes, and progress tracking.',
            technologies: ['Next.js', 'Tailwind', 'Prisma'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        }
    ]);

    // Default testimonials
    updateTestimonials([
        {
            name: 'John Doe',
            position: 'CEO',
            company: 'Tech Corp',
            content: 'Dhiraj is an exceptional developer. His work on our project was outstanding!',
            rating: 5
        },
        {
            name: 'Jane Smith',
            position: 'Project Manager',
            company: 'Design Studio',
            content: 'Working with Dhiraj was a great experience. He delivered beyond expectations.',
            rating: 5
        }
    ]);
}

// ========== TYPING ANIMATION ==========
function initTypingAnimation() {
    const typedText = document.querySelector('.typed-text');
    if (!typedText) return;
    
    const words = ['Developer', 'BICTE Student', 'Tech Enthusiast', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        typedText.textContent = isDeleting 
            ? currentWord.substring(0, charIndex - 1)
            : currentWord.substring(0, charIndex + 1);
        
        charIndex += isDeleting ? -1 : 1;

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(type, 1500);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(type, 500);
        } else {
            setTimeout(type, isDeleting ? 50 : 100);
        }
    }
    type();
}

// ========== NAVBAR SCROLL ==========
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
    
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });
}

// ========== BACK TO TOP ==========
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 500);
    });
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (!targetId || targetId === '#') return;
            
            if (targetId.startsWith('#')) {
                try {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                } catch (error) {
                    console.log('Invalid selector:', targetId);
                }
            }
        });
    });
}

// ========== CURRENT YEAR ==========
function updateCurrentYear() {
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// ========== STORAGE EVENT LISTENER ==========
window.addEventListener('storage', (e) => {
    if (e.key === 'adminUpdate') {
        console.log('🔄 Admin update detected, refreshing...');
        loadAllData();
    }
});

// ========== GLOBAL CLICK HANDLER FOR SOCIAL LINKS ==========
document.addEventListener('click', function(e) {
    const socialLink = e.target.closest('[data-social]');
    if (socialLink) {
        e.preventDefault();
        const url = socialLink.href;
        if (url && url !== '#' && url !== '') {
            window.open(url, '_blank');
        }
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portfolio initializing...');
    
    // Load all data
    loadAllData();
    
    // Load favicon
    loadFavicon();
    
    // Initialize all UI components
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initTypingAnimation();
    updateCurrentYear();
    
    // Auto refresh every 30 seconds
    setInterval(loadAllData, REFRESH_INTERVAL);
    
    console.log('✅ Portfolio ready!');
});

// ========== DEBUG ==========
window.debug = {
    reload: loadAllData,
    api: API_URL,
    test: () => {
        fetch(`${API_URL}/test`).then(r => r.json()).then(console.log);
    }
};