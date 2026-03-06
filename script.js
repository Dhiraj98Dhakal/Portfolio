// script.js - Complete Dynamic Frontend with Favicon Support
// ============================================
// CONFIGURATION
// ============================================
// script.js र admin/admin.js मा
const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const REFRESH_INTERVAL = 30000; // 30 seconds

console.log('✅ Frontend JS Loaded with API_URL:', API_URL);

// ============================================
// FAVICON SETUP
// ============================================

/**
 * Set favicon dynamically
 * @param {string} iconUrl - URL of the favicon image
 */
function setFavicon(iconUrl) {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    existingLinks.forEach(link => link.remove());
    
    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = iconUrl || '/icons/favicon.png'; // Default fallback
    
    document.head.appendChild(link);
    
    // Also set for Apple devices
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = iconUrl || '/icons/apple-icon.png';
    document.head.appendChild(appleLink);
    
    console.log('✅ Favicon set to:', iconUrl);
}

/**
 * Load favicon from profile or use default
 */
async function loadFavicon() {
    try {
        // Try to get favicon from profile settings
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        if (settings.favicon) {
            setFavicon(`${BASE_URL}${settings.favicon}`);
        } else {
            // Check if custom favicon exists in uploads
            const uploadsRes = await fetch(`${API_URL}/uploads`);
            const uploads = await uploadsRes.json();
            
            const faviconFile = uploads.files?.find(f => 
                f.includes('favicon') || f.includes('icon')
            );
            
            if (faviconFile) {
                setFavicon(`${BASE_URL}/uploads/${faviconFile}`);
            } else {
                // Default favicon
                setFavicon('/icons/favicon.png');
            }
        }
    } catch (error) {
        console.log('Using default favicon');
        setFavicon('/icons/favicon.png');
    }
}

// ============================================
// LOAD ALL DYNAMIC DATA
// ============================================

/**
 * Load all data from backend
 */
async function loadAllData() {
    try {
        // Load profile data
        const profileRes = await fetch(`${API_URL}/profile`);
        const profile = await profileRes.json();
        updateProfileData(profile);

        // Load skills
        const skillsRes = await fetch(`${API_URL}/skills`);
        const skills = await skillsRes.json();
        updateSkills(skills);

        // Load projects
        const projectsRes = await fetch(`${API_URL}/projects`);
        const projects = await projectsRes.json();
        updateProjects(projects);

        // Load settings
        const settingsRes = await fetch(`${API_URL}/settings`);
        const settings = await settingsRes.json();
        updateSettings(settings);
        
        // Load testimonials (if available)
        try {
            const testimonialsRes = await fetch(`${API_URL}/testimonials`);
            const testimonials = await testimonialsRes.json();
            updateTestimonials(testimonials);
        } catch (e) {
            console.log('No testimonials endpoint');
        }

        console.log('✅ All data loaded from server at', new Date().toLocaleTimeString());
    } catch (error) {
        console.log('❌ Using default data (backend not connected)');
        loadDefaultData();
    }
}

// ============================================
// UPDATE PROFILE DATA
// ============================================

/**
 * Update all profile-related elements
 * @param {Object} profile - Profile data from server
 */
function updateProfileData(profile) {
    // Update text elements with data-profile attribute
    document.querySelectorAll('[data-profile]').forEach(el => {
        const key = el.getAttribute('data-profile');
        if (profile[key]) {
            if (el.tagName === 'IMG') {
                // Handle images
                el.src = profile[key].startsWith('http') 
                    ? profile[key] 
                    : `${BASE_URL}${profile[key]}`;
                el.onerror = () => {
                    el.src = '/images/default-profile.jpg';
                };
            } else if (el.tagName === 'A' && key.includes('email')) {
                // Email links
                el.href = `mailto:${profile[key]}`;
                el.textContent = profile[key];
            } else if (el.tagName === 'A' && key.includes('phone')) {
                // Phone links
                el.href = `tel:${profile[key]}`;
                el.textContent = profile[key];
            } else {
                // Regular text
                el.textContent = profile[key];
            }
        }
    });

    // Update social links
    if (profile.socialLinks) {
        document.querySelectorAll('[data-social]').forEach(el => {
            const platform = el.getAttribute('data-social');
            if (profile.socialLinks[platform]) {
                el.href = profile.socialLinks[platform];
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            }
        });
    }

    // Update stats if available
    if (profile.stats) {
        document.querySelectorAll('[data-stat]').forEach(el => {
            const statKey = el.getAttribute('data-stat');
            if (profile.stats[statKey]) {
                el.textContent = profile.stats[statKey];
            }
        });
    }

    // Update document title
    if (profile.name) {
        document.title = profile.name ? `${profile.name} - Portfolio` : 'Portfolio';
    }
    
    // Update meta tags
    updateMetaTags(profile);
}

// ============================================
// UPDATE SKILLS
// ============================================

/**
 * Update skills grid
 * @param {Array} skills - Skills array from server
 */
function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    if (!skills || skills.length === 0) {
        container.innerHTML = '<p class="no-data">No skills added yet</p>';
        return;
    }

    container.innerHTML = skills.map(skill => `
        <div class="skill-card" data-skill-id="${skill.id}">
            <div class="skill-header">
                <i class="${skill.icon}" style="color: ${skill.color || '#667eea'}"></i>
                <h3>${skill.name}</h3>
            </div>
            <div class="skill-progress">
                <div class="skill-progress-bar" style="width: ${skill.level}%"></div>
            </div>
            <div class="skill-footer">
                <span class="skill-percentage">${skill.level}%</span>
                ${skill.category ? `<span class="skill-category">${skill.category}</span>` : ''}
            </div>
        </div>
    `).join('');
}

// ============================================
// UPDATE PROJECTS
// ============================================

/**
 * Update projects grid
 * @param {Array} projects - Projects array from server
 */
function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No projects added yet</p>';
        return;
    }

    // Sort by featured first, then by date
    const sortedProjects = [...projects].sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.id || 0) - (a.id || 0);
    });

    container.innerHTML = sortedProjects.map(project => {
        const imageUrl = project.image?.startsWith('http') 
            ? project.image 
            : project.image ? `${BASE_URL}${project.image}` : null;
        
        return `
        <div class="project-card ${project.featured ? 'featured' : ''}" data-project-id="${project.id}">
            <div class="project-image">
                <img src="${imageUrl || 'https://via.placeholder.com/300x200?text=Project'}" 
                     alt="${project.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200?text=Project'">
                ${project.featured ? '<span class="featured-badge">★ Featured</span>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                <div class="project-tech">
                    ${project.technologies.map(tech => 
                        `<span class="tech-tag">${tech}</span>`
                    ).join('')}
                </div>
                <div class="project-links">
                    ${project.github ? `
                        <a href="${project.github}" target="_blank" class="project-link" rel="noopener">
                            <i class="fab fa-github"></i> Code
                        </a>
                    ` : ''}
                    ${project.demo ? `
                        <a href="${project.demo}" target="_blank" class="project-link" rel="noopener">
                            <i class="fas fa-external-link-alt"></i> Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    
    // Re-initialize filter functionality
    initProjectFilters();
}

// ============================================
// UPDATE TESTIMONIALS - FIXED
// ============================================

/**
 * Update testimonials section
 * @param {Array} testimonials - Testimonials array from server
 */
function updateTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    if (!testimonials || testimonials.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'grid';
    container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <i class="fas fa-quote-left"></i>
                <p>${t.content || ''}</p>
            </div>
            <div class="testimonial-author">
                ${t.image ? `<img src="${BASE_URL}${t.image}" alt="${t.name || 'Client'}">` : ''}
                <div class="author-info">
                    <h4>${t.name || 'Anonymous'}</h4>
                    <p>${t.position || ''}${t.company ? ', ' + t.company : ''}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// UPDATE SETTINGS
// ============================================

/**
 * Update site settings
 * @param {Object} settings - Settings data from server
 */
function updateSettings(settings) {
    // Update elements with data-settings attribute
    document.querySelectorAll('[data-settings]').forEach(el => {
        const key = el.getAttribute('data-settings');
        if (settings[key]) {
            if (el.tagName === 'META') {
                el.setAttribute('content', settings[key]);
            } else {
                el.textContent = settings[key];
            }
        }
    });
    
    // Update HTML lang attribute
    if (settings.siteLanguage) {
        document.documentElement.lang = settings.siteLanguage;
    }
    
    // Update favicon if provided in settings
    if (settings.favicon) {
        setFavicon(`${BASE_URL}${settings.favicon}`);
    }
}

// ============================================
// UPDATE META TAGS
// ============================================

/**
 * Update meta tags for SEO
 * @param {Object} profile - Profile data
 */
function updateMetaTags(profile) {
    // Update or create meta tags
    const metaTags = {
        'description': profile.bio || 'Portfolio website',
        'author': profile.name || 'Dhiraj Dhakal',
        'keywords': 'portfolio, developer, web development, nepal'
    };
    
    Object.entries(metaTags).forEach(([name, content]) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    });
    
    // Open Graph tags
    const ogTags = {
        'og:title': profile.name ? `${profile.name} - Portfolio` : 'Portfolio',
        'og:description': profile.bio || 'Portfolio website',
        'og:type': 'website',
        'og:url': window.location.href,
        'og:image': profile.profileImage ? `${BASE_URL}${profile.profileImage}` : '/images/og-image.jpg'
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    });
}

// ============================================
// PROJECT FILTERS
// ============================================

/**
 * Initialize project filter buttons
 */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            const filter = btn.dataset.filter;
            
            projectCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'featured') {
                    const isFeatured = card.classList.contains('featured');
                    card.style.display = isFeatured ? 'block' : 'none';
                }
            });
        });
    });
}

// ============================================
// CONTACT FORM HANDLING - FIXED
// ============================================

/**
 * Initialize contact form
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name')?.value,
            email: document.getElementById('email')?.value,
            subject: document.getElementById('subject')?.value || 'No Subject',
            message: document.getElementById('message')?.value
        };
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Message sent successfully!', 'success');
                form.reset();
            } else {
                showNotification('Error sending message', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error sending message', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

/**
 * Show notification
 * @param {string} message - Message to display
 * @param {string} type - success/error/warning/info
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                    type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                    'linear-gradient(135deg, #3b82f6, #2563eb)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// DEFAULT DATA (FALLBACK)
// ============================================

/**
 * Load default data when backend is not available
 */
function loadDefaultData() {
    // Default skills
    updateSkills([
        { id: 1, name: 'HTML5', level: 95, icon: 'fab fa-html5', color: '#E34F26' },
        { id: 2, name: 'CSS3', level: 92, icon: 'fab fa-css3-alt', color: '#1572B6' },
        { id: 3, name: 'JavaScript', level: 88, icon: 'fab fa-js', color: '#F7DF1E' },
        { id: 4, name: 'React', level: 85, icon: 'fab fa-react', color: '#61DAFB' },
        { id: 5, name: 'Node.js', level: 78, icon: 'fab fa-node', color: '#339933' }
    ]);

    // Default projects
    updateProjects([
        {
            id: 1,
            title: 'Smart Attendance System',
            description: 'QR code based attendance system for college students',
            technologies: ['React', 'Node.js', 'MongoDB'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        },
        {
            id: 2,
            title: 'E-Learning Platform',
            description: 'Online learning platform with video courses',
            technologies: ['Next.js', 'Tailwind', 'Prisma'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        },
        {
            id: 3,
            title: 'Weather App',
            description: 'Real-time weather application',
            technologies: ['React', 'API', 'Chart.js'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: false
        }
    ]);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

/**
 * Initialize navbar scroll effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileMenu = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

/**
 * Initialize back to top button
 */
function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// SMOOTH SCROLLING
// ============================================

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// CURRENT YEAR
// ============================================

/**
 * Update current year in footer
 */
function updateCurrentYear() {
    document.querySelectorAll('.current-year').forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// ============================================
// AUTO-REFRESH
// ============================================

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        loadAllData();
    }, REFRESH_INTERVAL);
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize everything when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio initializing...');
    
    // Load favicon first
    await loadFavicon();
    
    // Load all data
    await loadAllData();
    
    // Initialize features
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initContactForm();
    initScrollAnimations();
    updateCurrentYear();
    
    // Start auto-refresh
    startAutoRefresh();
    
    console.log('✅ Portfolio ready at', new Date().toLocaleTimeString());
});

// ============================================
// EXPOSE FUNCTIONS FOR DEBUGGING
// ============================================

// Make useful functions available in console
window.debug = {
    reloadData: loadAllData,
    refreshFavicon: loadFavicon,
    setFavicon: setFavicon,
    showNotification: showNotification,
    getVersion: () => '2.0.0'
};