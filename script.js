// ============================================
// script.js - Complete Dynamic Frontend
// ============================================

// ========== CONFIGURATION ==========
const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const REFRESH_INTERVAL = 30000; // 30 seconds

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

// ========== CUSTOM CURSOR ==========
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 50);
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Hover effect for links
    document.querySelectorAll('a, button, .project-card, .skill-card, .social-icon').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
            cursorFollower.classList.remove('active');
        });
    });
}

// ========== LOAD ALL DATA ==========
async function loadAllData() {
    try {
        console.log('🔄 Loading data from backend...');
        
        // Load profile
        const profileRes = await fetch(`${API_URL}/profile`);
        const profile = await profileRes.json();
        console.log('📥 Profile loaded:', profile);
        updateProfile(profile);

        // Load skills
        const skillsRes = await fetch(`${API_URL}/skills`);
        const skills = await skillsRes.json();
        console.log('📥 Skills loaded:', skills.length);
        updateSkills(skills);

        // Load projects
        const projectsRes = await fetch(`${API_URL}/projects`);
        const projects = await projectsRes.json();
        console.log('📥 Projects loaded:', projects.length);
        updateProjects(projects);

        // Load testimonials
        const testimonialsRes = await fetch(`${API_URL}/testimonials`);
        const testimonials = await testimonialsRes.json();
        console.log('📥 Testimonials loaded:', testimonials.length);
        updateTestimonials(testimonials);

        // Load settings
        const settingsRes = await fetch(`${API_URL}/settings`);
        const settings = await settingsRes.json();
        console.log('📥 Settings loaded');
        updateSettings(settings);

        console.log('✅ All data loaded at', new Date().toLocaleTimeString());
    } catch (error) {
        console.log('❌ Backend not connected, using default data:', error);
        loadDefaultData();
    }
}

// ========== UPDATE PROFILE ==========
function updateProfile(profile) {
    // Update text elements
    document.querySelectorAll('[data-profile]').forEach(el => {
        const key = el.getAttribute('data-profile');
        if (profile[key]) {
            if (el.tagName === 'IMG') {
                el.src = profile[key].startsWith('http') ? profile[key] : `${BASE_URL}${profile[key]}`;
                el.onerror = () => {
                    el.src = '/images/default-profile.jpg';
                };
                console.log(`✅ Updated image: ${key}`);
            } else if (el.tagName === 'A' && key.includes('email')) {
                el.href = `mailto:${profile[key]}`;
                el.textContent = profile[key];
                console.log(`✅ Updated email: ${profile[key]}`);
            } else if (el.tagName === 'A' && key.includes('phone')) {
                el.href = `tel:${profile[key]}`;
                el.textContent = profile[key];
                console.log(`✅ Updated phone: ${profile[key]}`);
            } else {
                el.textContent = profile[key];
                console.log(`✅ Updated text: ${key} = ${profile[key]}`);
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
                console.log(`✅ Updated stat: ${key} = ${profile.stats[key]}`);
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
            console.log(`✅ Updated ${platform}: ${url}`);
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
        container.innerHTML = '<p class="no-data">No skills added yet</p>';
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
            <div class="skill-footer">
                <span class="skill-percentage">${skill.level}%</span>
                ${skill.category ? `<span class="skill-category">${skill.category}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    console.log('✅ Skills updated:', skills.length);
}

// ========== UPDATE PROJECTS ==========
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
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    container.innerHTML = sortedProjects.map(project => {
        const imageUrl = project.image?.startsWith('http') 
            ? project.image 
            : project.image ? `${BASE_URL}${project.image}` : null;
        
        return `
        <div class="project-card ${project.featured ? 'featured' : ''}">
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
                        <a href="${project.github}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i> Code
                        </a>
                    ` : ''}
                    ${project.demo ? `
                        <a href="${project.demo}" target="_blank" class="project-link">
                            <i class="fas fa-external-link-alt"></i> Live
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    
    initProjectFilters();
    console.log('✅ Projects updated:', projects.length);
}

// ========== UPDATE TESTIMONIALS ==========
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
                <p>${t.content}</p>
            </div>
            <div class="testimonial-author">
                ${t.image ? `<img src="${BASE_URL}${t.image}" alt="${t.name}">` : ''}
                <div class="author-info">
                    <h4>${t.name}</h4>
                    <p>${t.position}${t.company ? ', ' + t.company : ''}</p>
                    <div class="rating">
                        ${'⭐'.repeat(t.rating)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Testimonials updated:', testimonials.length);
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

// ========== TYPING ANIMATION ==========
function initTypingAnimation() {
    const typedText = document.querySelector('.typed-text');
    if (!typedText) return;
    
    const words = ['Developer', 'BICTE Student', 'Tech Enthusiast', 'Problem Solver', 'Designer'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typedText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

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
    
    setTimeout(type, 1000);
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
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         'fa-info-circle'}"></i>
        <span>${message}</span>
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
        { id: 1, name: 'HTML5', level: 95, icon: 'fab fa-html5', color: '#E34F26' },
        { id: 2, name: 'CSS3', level: 92, icon: 'fab fa-css3-alt', color: '#1572B6' },
        { id: 3, name: 'JavaScript', level: 88, icon: 'fab fa-js', color: '#F7DF1E' },
        { id: 4, name: 'React', level: 85, icon: 'fab fa-react', color: '#61DAFB' },
        { id: 5, name: 'Node.js', level: 78, icon: 'fab fa-node', color: '#339933' }
    ]);

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

// ========== SCROLL ANIMATIONS ==========
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.skill-card, .project-card, .about-content, .contact-item, .testimonial-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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
    
    // Active link on scroll
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
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
            
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        showNotification('Data updated from admin!', 'success');
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Portfolio initializing...');
    
    // Load favicon first
    await loadFavicon();
    
    // Load all data
    await loadAllData();
    
    // Initialize all features
    initCursor();
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initContactForm();
    initScrollAnimations();
    initTypingAnimation();
    updateCurrentYear();
    
    // Start auto-refresh
    startAutoRefresh();
    
    console.log('✅ Portfolio ready at', new Date().toLocaleTimeString());
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refreshed') === 'true') {
        showNotification('Data refreshed from admin!', 'success');
    }
});

// ========== EXPOSE DEBUG FUNCTIONS ==========
window.debug = {
    reload: loadAllData,
    refresh: () => {
        loadAllData();
        showNotification('Manual refresh complete!', 'success');
    },
    api: API_URL,
    version: '2.0.0'
};