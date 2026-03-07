const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const REFRESH_INTERVAL = 60000;

console.log('✅ Frontend Loaded');

async function loadAllData() {
    try {
        const profile = await fetch(`${API_URL}/profile`).then(r => r.json());
        updateProfile(profile);
        
        const skills = await fetch(`${API_URL}/skills`).then(r => r.json());
        updateSkills(skills);
        
        const projects = await fetch(`${API_URL}/projects`).then(r => r.json());
        updateProjects(projects);
        
        const settings = await fetch(`${API_URL}/settings`).then(r => r.json());
        updateSettings(settings);
    } catch (error) {
        console.log('Backend not connected, using default data');
    }
}

function updateProfile(profile) {
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
    
    if (profile.socialLinks) {
        document.querySelectorAll('[data-social]').forEach(el => {
            const platform = el.dataset.social;
            const url = profile.socialLinks[platform];
            if (url) {
                el.href = url;
                el.style.display = 'flex';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    if (profile.stats) {
        document.querySelectorAll('[data-stat]').forEach(el => {
            const key = el.dataset.stat;
            if (profile.stats[key]) el.textContent = profile.stats[key];
        });
    }
}

function updateSkills(skills) {
    const container = document.getElementById('skills-container');
    if (!container) return;
    if (!skills?.length) {
        container.innerHTML = '<p class="no-data">No skills added</p>';
        return;
    }
    container.innerHTML = skills.map(s => `
        <div class="skill-card">
            <div class="skill-header"><i class="${s.icon}"></i><h3>${s.name}</h3></div>
            <div class="skill-progress"><div class="skill-progress-bar" style="width:${s.level}%"></div></div>
            <span class="skill-percentage">${s.level}%</span>
        </div>
    `).join('');
}

function updateProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    if (!projects?.length) {
        container.innerHTML = '<p class="no-data">No projects added</p>';
        return;
    }
    container.innerHTML = projects.map(p => `
        <div class="project-card ${p.featured ? 'featured' : ''}">
            <div class="project-image">
                <img src="${p.image ? BASE_URL + p.image : 'https://via.placeholder.com/300x200'}" alt="${p.title}">
                ${p.featured ? '<span class="featured-badge">★ Featured</span>' : ''}
            </div>
            <div class="project-content">
                <h3 class="project-title">${p.title}</h3>
                <p class="project-description">${p.description.substring(0,100)}...</p>
                <div class="project-tech">${p.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
                <div class="project-links">
                    <a href="${p.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> Code</a>
                    <a href="${p.demo}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// UPDATE TESTIMONIALS
// ============================================
async function updateTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (!testimonials || testimonials.length === 0) {
            if (container) container.style.display = 'none';
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
    } catch (error) {
        console.log('No testimonials found');
        if (container) container.style.display = 'none';
    }
}

// loadAllData() function मा यो call थप्नुहोस्
// await updateTestimonials();

function updateSettings(settings) {
    document.querySelectorAll('[data-settings]').forEach(el => {
        const key = el.dataset.settings;
        if (settings[key]) {
            if (el.tagName === 'META') el.setAttribute('content', settings[key]);
            else el.textContent = settings[key];
        }
    });
}

document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value, email: form.email.value,
        subject: form.subject.value || 'No Subject', message: form.message.value
    };
    try {
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.success ? 'Message sent!' : 'Error sending message');
        if (result.success) form.reset();
    } catch { alert('Error sending message'); }
});

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    setInterval(loadAllData, REFRESH_INTERVAL);
});