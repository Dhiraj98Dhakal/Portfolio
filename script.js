// ============================================
// script.js - Complete Dynamic Frontend
// ============================================

const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const REFRESH_INTERVAL = 30000;

console.log('✅ Frontend JS Loaded');
console.log('📍 API URL:', API_URL);

// ========== LOAD ALL DATA ==========
async function loadAllData() {
    try {
        console.log('🔄 Loading data from backend...');
        
        // Load profile
        const profileRes = await fetch(`${API_URL}/profile`);
        const profile = await profileRes.json();
        updateProfile(profile);

        // Load skills
        const skillsRes = await fetch(`${API_URL}/skills`);
        const skills = await skillsRes.json();
        updateSkills(skills);

        // Load projects
        const projectsRes = await fetch(`${API_URL}/projects`);
        const projects = await projectsRes.json();
        updateProjects(projects);

        // Load testimonials with error handling
        try {
            const testimonialsRes = await fetch(`${API_URL}/testimonials`);
            if (testimonialsRes.ok) {
                const testimonials = await testimonialsRes.json();
                updateTestimonials(testimonials);
            } else {
                hideTestimonials();
            }
        } catch (error) {
            console.log('Testimonials not available');
            hideTestimonials();
        }

        console.log('✅ All data loaded at', new Date().toLocaleTimeString());
    } catch (error) {
        console.log('❌ Backend not connected, using default data');
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
                    el.src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22350%22%20height%3D%22350%22%20viewBox%3D%220%200%20350%20350%22%3E%3Crect%20width%3D%22350%22%20height%3D%22350%22%20fill%3D%22%230a0a0f%22%2F%3E%3Ctext%20x%3D%22175%22%20y%3D%22175%22%20font-family%3D%27Arial%27%20font-size%3D%2224%22%20fill%3D%22%2300f3ff%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EDD%3C%2Ftext%3E%3C%2Fsvg%3E';
                };
            } else if (el.tagName === 'A' && key.includes('email')) {
                el.href = `mailto:${profile[key]}`;
                el.textContent = profile[key];
            } else if (el.tagName === 'A' && key.includes('phone')) {
                el.href = `tel:${profile[key]}`;
                el.textContent = profile[key];
            } else {
                el.textContent = profile[key];
            }
        }
    });

    // Update social links
    if (profile.socialLinks) {
        document.querySelectorAll('[data-social]').forEach(el => {
            const platform = el.getAttribute('data-social');
            const url = profile.socialLinks[platform];
            if (url && url.trim() !== '') {
                el.href = url;
                el.style.display = 'flex';
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Update stats
    if (profile.stats) {
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
            <span class="skill-percentage">${skill.level}%</span>
        </div>
    `).join('');
}

// ========== UPDATE PROJECTS ==========
function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No projects added yet</p>';
        return;
    }

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
}

// ========== UPDATE TESTIMONIALS ==========
function updateTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;
    
    if (!Array.isArray(testimonials) || testimonials.length === 0) {
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
                    <div class="rating">
                        ${'⭐'.repeat(t.rating || 5)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function hideTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (container) {
        container.style.display = 'none';
    }
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
            alert('Message sent successfully!');
            e.target.reset();
        } else {
            alert('Error sending message');
        }
    } catch (error) {
        alert('Error sending message');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== DEFAULT DATA ==========
function loadDefaultData() {
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
            description: 'QR code based attendance system',
            technologies: ['React', 'Node.js', 'MongoDB'],
            github: '#',
            demo: '#',
            featured: true
        },
        {
            title: 'E-Learning Platform',
            description: 'Online learning platform',
            technologies: ['Next.js', 'Tailwind', 'Prisma'],
            github: '#',
            demo: '#',
            featured: true
        }
    ]);
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

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portfolio initializing...');
    
    loadAllData();
    
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initTypingAnimation();
    updateCurrentYear();
    
    setInterval(loadAllData, REFRESH_INTERVAL);
    
    console.log('✅ Portfolio ready!');
});

// ========== DEBUG ==========
window.debug = {
    reload: loadAllData,
    api: API_URL
};