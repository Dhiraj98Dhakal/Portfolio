// ============================================
// script.js - Complete Dynamic Frontend
// ============================================

// ========== CONFIGURATION ==========
const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const REFRESH_INTERVAL = 60000; // 60 seconds

console.log('✅ Frontend JS Loaded');
console.log('📍 API URL:', API_URL);

// ========== FAVICON SETUP ==========
function setFavicon(iconUrl) {
    const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    existingLinks.forEach(link => link.remove());
    
    if (iconUrl) {
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
        link.href = '/icons/favicon.png';
        document.head.appendChild(link);
    }
}

async function loadFavicon() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        if (settings.favicon) {
            setFavicon(`${BASE_URL}${settings.favicon}`);
        } else {
            setFavicon('/icons/favicon.png');
        }
    } catch (error) {
        console.log('Using default favicon');
        setFavicon('/icons/favicon.png');
    }
}

// ========== LOAD ALL DATA ==========
async function loadAllData() {
    try {
        console.log('🔄 Loading data from:', API_URL);
        
        // Load profile
        const profileRes = await fetch(`${API_URL}/profile`);
        const profile = await profileRes.json();
        console.log('📥 Profile data:', profile);
        updateProfileData(profile);

        // Load skills
        const skillsRes = await fetch(`${API_URL}/skills`);
        const skills = await skillsRes.json();
        console.log('📥 Skills data:', skills.length);
        updateSkills(skills);

        // Load projects
        const projectsRes = await fetch(`${API_URL}/projects`);
        const projects = await projectsRes.json();
        console.log('📥 Projects data:', projects.length);
        updateProjects(projects);

        // Load settings
        const settingsRes = await fetch(`${API_URL}/settings`);
        const settings = await settingsRes.json();
        console.log('📥 Settings data:', settings);
        updateSettings(settings);

        console.log('✅ All data loaded at', new Date().toLocaleTimeString());
    } catch (error) {
        console.log('❌ Backend not connected, using default data:', error);
        loadDefaultData();
    }
}

// ========== UPDATE PROFILE DATA ==========
function updateProfileData(profile) {
    console.log('📤 Updating profile data in DOM...');
    
    // Update text elements
    document.querySelectorAll('[data-profile]').forEach(el => {
        const key = el.getAttribute('data-profile');
        if (profile[key]) {
            if (el.tagName === 'IMG') {
                if (profile[key]) {
                    el.src = profile[key].startsWith('http') ? profile[key] : `${BASE_URL}${profile[key]}`;
                }
                el.onerror = () => { el.src = '/images/default-profile.jpg'; };
                console.log(`✅ Updated image ${key}`);
            } else if (el.tagName === 'A' && key.includes('email')) {
                el.href = `mailto:${profile[key]}`;
                el.textContent = profile[key];
                console.log(`✅ Updated email:`, profile[key]);
            } else if (el.tagName === 'A' && key.includes('phone')) {
                el.href = `tel:${profile[key]}`;
                el.textContent = profile[key];
                console.log(`✅ Updated phone:`, profile[key]);
            } else {
                el.textContent = profile[key];
                console.log(`✅ Updated text ${key}:`, profile[key]);
            }
        }
    });

    // Update social links
    updateSocialLinks(profile);

    // Update stats
    if (profile.stats) {
        document.querySelectorAll('[data-stat]').forEach(el => {
            const key = el.getAttribute('data-stat');
            if (profile.stats[key]) {
                el.textContent = profile.stats[key];
                console.log(`✅ Updated stat ${key}:`, profile.stats[key]);
            }
        });
    }

    // Update document title
    if (profile.name) {
        document.title = `${profile.name} - Portfolio`;
    }
}

// ========== UPDATE SOCIAL LINKS ==========
function updateSocialLinks(profile) {
    if (!profile || !profile.socialLinks) {
        console.log('⚠️ No social links in profile');
        return;
    }
    
    const links = profile.socialLinks;
    console.log('📤 Updating social links:', links);
    
    document.querySelectorAll('[data-social]').forEach(el => {
        const platform = el.getAttribute('data-social');
        const url = links[platform];
        
        if (url && url.trim() !== '') {
            el.href = url;
            el.style.display = 'flex';
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
            console.log(`✅ Updated ${platform}:`, url);
        } else {
            el.style.display = 'none';
            console.log(`❌ Hidden ${platform} - no URL`);
        }
    });
}

// ========== UPDATE SKILLS ==========
function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;

    if (!skills || skills.length === 0) {
        container.innerHTML = '<p class="no-data">No skills added</p>';
        return;
    }

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
    
    console.log('✅ Skills updated:', skills.length);
}

// ========== UPDATE PROJECTS ==========
function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No projects added</p>';
        return;
    }

    container.innerHTML = projects.map(project => {
        const imageUrl = project.image?.startsWith('http') 
            ? project.image 
            : project.image ? `${BASE_URL}${project.image}` : null;
        
        return `
        <div class="project-card ${project.featured ? 'featured' : ''}">
            <div class="project-image">
                <img src="${imageUrl || 'https://via.placeholder.com/300x200'}" 
                     alt="${project.title}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/300x200'">
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
                    <a href="${project.github}" target="_blank" class="project-link">
                        <i class="fab fa-github"></i> Code
                    </a>
                    <a href="${project.demo}" target="_blank" class="project-link">
                        <i class="fas fa-external-link-alt"></i> Live
                    </a>
                </div>
            </div>
        </div>
    `}).join('');
    
    initProjectFilters();
    console.log('✅ Projects updated:', projects.length);
}

// ========== UPDATE SETTINGS ==========
function updateSettings(settings) {
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
    
    if (settings.siteLanguage) {
        document.documentElement.lang = settings.siteLanguage;
    }
    
    console.log('✅ Settings updated');
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

// ========== CONTACT FORM ==========
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
                headers: { 'Content-Type': 'application/json' },
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
            console.error('Contact form error:', error);
            showNotification('Error sending message', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ========== NOTIFICATION ==========
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ========== DEFAULT DATA ==========
function loadDefaultData() {
    console.log('📥 Loading default data...');
    
    updateSkills([
        { name: 'HTML5', level: 95, icon: 'fab fa-html5', color: '#E34F26' },
        { name: 'CSS3', level: 92, icon: 'fab fa-css3-alt', color: '#1572B6' },
        { name: 'JavaScript', level: 88, icon: 'fab fa-js', color: '#F7DF1E' },
        { name: 'React', level: 85, icon: 'fab fa-react', color: '#61DAFB' },
        { name: 'Node.js', level: 78, icon: 'fab fa-node', color: '#339933' }
    ]);

    updateProjects([
        {
            title: 'Smart Attendance System',
            description: 'QR code based attendance system for college students',
            technologies: ['React', 'Node.js', 'MongoDB'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        },
        {
            title: 'E-Learning Platform',
            description: 'Online learning platform with video courses',
            technologies: ['Next.js', 'Tailwind', 'Prisma'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: true
        },
        {
            title: 'Weather App',
            description: 'Real-time weather application',
            technologies: ['React', 'API', 'Chart.js'],
            github: 'https://github.com',
            demo: 'https://demo.com',
            featured: false
        }
    ]);
}

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
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
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
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

// ========== TYPING ANIMATION ==========
function initTypingAnimation() {
    const typedText = document.querySelector('.typed-text');
    const words = ['Developer', 'BICTE Student', 'Tech Enthusiast', 'Problem Solver'];
    if (!typedText) return;
    
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

// ========== AUTO REFRESH ==========
function startAutoRefresh() {
    if (window.refreshInterval) {
        clearInterval(window.refreshInterval);
    }
    
    window.refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        loadAllData();
    }, REFRESH_INTERVAL);
}

// ========== MANUAL REFRESH ==========
window.manualRefresh = function() {
    console.log('🔄 Manual refresh triggered...');
    loadAllData();
    showNotification('Data refreshed!', 'success');
};

// ========== STORAGE EVENT LISTENER ==========
window.addEventListener('storage', (e) => {
    if (e.key === 'adminUpdate') {
        console.log('🔄 Admin update detected, refreshing...');
        loadAllData();
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio initializing...');
    
    await loadFavicon();
    await loadAllData();
    
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initContactForm();
    initScrollAnimations();
    initProjectFilters();
    initTypingAnimation();
    updateCurrentYear();
    
    startAutoRefresh();
    
    console.log('✅ Portfolio ready!');
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refreshed') === 'true') {
        showNotification('Data refreshed from admin!', 'success');
    }
});

// ========== DEBUG ==========
window.debug = {
    reload: loadAllData,
    refresh: () => {
        loadAllData();
        showNotification('Manual refresh complete!', 'success');
    },
    api: API_URL
};