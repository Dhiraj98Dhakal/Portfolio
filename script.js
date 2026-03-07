// ============================================
// script.js - Complete Fixed Version
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

        // Load testimonials (with error handling)
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

        console.log('✅ All data loaded');
    } catch (error) {
        console.log('❌ Backend not connected');
        loadDefaultData();
    }
}

function updateProfile(profile) {
    // Update text elements
    document.querySelectorAll('[data-profile]').forEach(el => {
        const key = el.dataset.profile;
        if (profile[key]) {
            if (el.tagName === 'IMG') {
                el.src = profile[key].startsWith('http') ? profile[key] : `${BASE_URL}${profile[key]}`;
            } else {
                el.textContent = profile[key];
            }
        }
    });

    // Update social links
    if (profile.socialLinks) {
        document.querySelectorAll('[data-social]').forEach(el => {
            const platform = el.dataset.social;
            const url = profile.socialLinks[platform];
            if (url && url.trim() !== '') {
                el.href = url;
                el.style.display = 'flex';
                el.target = '_blank';
            } else {
                el.style.display = 'none';
            }
        });
    }

    // Update stats
    if (profile.stats) {
        document.querySelectorAll('[data-stat]').forEach(el => {
            const key = el.dataset.stat;
            if (profile.stats[key]) {
                el.textContent = profile.stats[key];
            }
        });
    }
}

function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;
    
    if (!skills || skills.length === 0) {
        container.innerHTML = '<p class="no-data">No skills added</p>';
        return;
    }
    
    container.innerHTML = skills.map(s => `
        <div class="skill-card">
            <div class="skill-header">
                <i class="${s.icon}" style="color:${s.color || '#00f3ff'}"></i>
                <h3>${s.name}</h3>
            </div>
            <div class="skill-progress">
                <div class="skill-progress-bar" style="width:${s.level}%"></div>
            </div>
            <span class="skill-percentage">${s.level}%</span>
        </div>
    `).join('');
}

function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="no-data">No projects added</p>';
        return;
    }
    
    container.innerHTML = projects.map(p => {
        // Use local fallback instead of placeholder.com
        const imageUrl = p.image ? BASE_URL + p.image : null;
        
        return `
        <div class="project-card ${p.featured ? 'featured' : ''}">
            <div class="project-image">
                ${imageUrl ? 
                    `<img src="${imageUrl}" alt="${p.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\'fallback-image\' style=\'width:100%;height:100%;background:linear-gradient(135deg,#00f3ff,#ff00c8);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:bold;\'>${p.title.substring(0,2)}</div>'">` 
                    : `<div class="fallback-image" style="width:100%;height:100%;background:linear-gradient(135deg,#00f3ff,#ff00c8);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:bold;">${p.title.substring(0,2)}</div>`
                }
                ${p.featured ? '<span class="featured-badge">★ Featured</span>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${p.title}</h3>
                <p class="project-description">${p.description.substring(0,100)}...</p>
                <div class="project-tech">
                    ${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${p.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> Code</a>
                    <a href="${p.demo}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live</a>
                </div>
            </div>
        </div>
    `}).join('');
    
    initProjectFilters();
}

function updateTestimonials(testimonials) {
    const container = document.getElementById('testimonials-container');
    if (!container || !testimonials || testimonials.length === 0) {
        hideTestimonials();
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
                    <p>${t.position || ''}${t.company ? ', ' + t.company : ''}</p>
                    <div class="rating">${'⭐'.repeat(t.rating || 5)}</div>
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

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            projectCards.forEach(card => {
                if (filter === 'all') card.style.display = 'block';
                else card.style.display = card.classList.contains('featured') ? 'block' : 'none';
            });
        });
    });
}

// Contact form
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value || 'No Subject',
        message: form.message.value
    };
    
    try {
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.success ? 'Message sent!' : 'Error');
        if (result.success) form.reset();
    } catch {
        alert('Error sending message');
    }
});

// Default data
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setInterval(loadAllData, REFRESH_INTERVAL);
});

// Debug
window.debug = { reload: loadAllData };