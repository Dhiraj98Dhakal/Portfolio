const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';

// ========== AUTH CHECK ==========
const token = localStorage.getItem('adminToken');
const loginTime = localStorage.getItem('adminLoginTime');
if (!token || !loginTime || (Date.now() - parseInt(loginTime) > 24*60*60*1000)) {
    localStorage.clear();
    window.location.href = 'index.html';
}

// ========== FETCH WITH AUTH ==========
async function fetchWithAuth(url, options = {}) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    const res = await fetch(url, options);
    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
    return res;
}

// ========== SECTION NAVIGATION ==========
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.getElementById(link.dataset.section + '-section').style.display = 'block';
        document.getElementById('pageTitle').textContent = link.textContent.trim();
        
        // Load section data
        const section = link.dataset.section;
        if (section === 'dashboard') loadDashboard();
        else if (section === 'profile') loadProfile();
        else if (section === 'projects') loadProjects();
        else if (section === 'skills') loadSkills();
        else if (section === 'social') loadSocial();
        else if (section === 'messages') loadMessages();
        else if (section === 'testimonials') loadTestimonials();
    });
});

// ========== DASHBOARD ==========
async function loadDashboard() {
    try {
        const [projects, skills, messages] = await Promise.all([
            fetch(`${API_URL}/projects`).then(r => r.json()).catch(() => []),
            fetch(`${API_URL}/skills`).then(r => r.json()).catch(() => []),
            fetchWithAuth(`${API_URL}/messages`).then(r => r.json()).catch(() => [])
        ]);
        
        document.getElementById('dashboard-stats').innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
                <div style="background:#12121a;padding:20px;border-radius:10px;text-align:center">
                    <h3 style="color:#00f3ff;font-size:2rem">${projects.length}</h3>
                    <p style="color:#c0c0ff">Projects</p>
                </div>
                <div style="background:#12121a;padding:20px;border-radius:10px;text-align:center">
                    <h3 style="color:#00f3ff;font-size:2rem">${skills.length}</h3>
                    <p style="color:#c0c0ff">Skills</p>
                </div>
                <div style="background:#12121a;padding:20px;border-radius:10px;text-align:center">
                    <h3 style="color:#00f3ff;font-size:2rem">${messages.length}</h3>
                    <p style="color:#c0c0ff">Messages</p>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('dashboard-stats').innerHTML = '<p>Error loading stats</p>';
    }
}

// ========== PROFILE ==========
async function loadProfile() {
    try {
        const profile = await fetch(`${API_URL}/profile`).then(r => r.json());
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileTitle').value = profile.title || '';
        document.getElementById('profileBio').value = profile.bio || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileLocation').value = profile.location || '';
        document.getElementById('profileCountry').value = profile.country || 'Nepal';
        document.getElementById('profileExperience').value = profile.experience || '2+';
        document.getElementById('profileInitials').value = profile.initials || 'D';
    } catch (error) {
        alert('Error loading profile');
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', document.getElementById('profileName').value);
    formData.append('title', document.getElementById('profileTitle').value);
    formData.append('bio', document.getElementById('profileBio').value);
    formData.append('email', document.getElementById('profileEmail').value);
    formData.append('phone', document.getElementById('profilePhone').value);
    formData.append('location', document.getElementById('profileLocation').value);
    formData.append('country', document.getElementById('profileCountry').value);
    formData.append('experience', document.getElementById('profileExperience').value);
    formData.append('initials', document.getElementById('profileInitials').value);
    
    const img = document.getElementById('profileImage')?.files[0];
    if (img) formData.append('profileImage', img);
    
    const res = await fetchWithAuth(`${API_URL}/profile`, { method: 'PUT', body: formData });
    const data = await res.json();
    alert(data.success ? 'Profile updated successfully!' : 'Error updating profile');
});

// ========== PROJECTS ==========
async function loadProjects() {
    try {
        const projects = await fetch(`${API_URL}/projects`).then(r => r.json());
        document.getElementById('projectsList').innerHTML = projects.map(p => `
            <tr>
                <td><img src="${p.image ? BASE_URL + p.image : 'https://via.placeholder.com/50'}" style="width:50px;height:50px;object-fit:cover"></td>
                <td>${p.title}</td>
                <td>${p.description.substring(0,50)}...</td>
                <td>${p.technologies?.slice(0,2).join(',')}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editProject('${p._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${p._id}')">Del</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('projectsList').innerHTML = '<tr><td colspan="5">Error loading projects</td></tr>';
    }
}

document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('projectTitle').value);
    formData.append('description', document.getElementById('projectDescription').value);
    formData.append('technologies', document.getElementById('projectTechnologies').value);
    formData.append('github', document.getElementById('projectGithub').value);
    formData.append('demo', document.getElementById('projectDemo').value);
    formData.append('featured', document.getElementById('projectFeatured').checked);
    
    const img = document.getElementById('projectImage')?.files[0];
    if (img) formData.append('image', img);
    
    const res = await fetchWithAuth(`${API_URL}/projects`, { method: 'POST', body: formData });
    const data = await res.json();
    alert(data.success ? 'Project added!' : 'Error');
    if (data.success) {
        e.target.reset();
        showSection('projects');
        loadProjects();
    }
});

window.deleteProject = async (id) => {
    if (!confirm('Delete?')) return;
    const res = await fetchWithAuth(`${API_URL}/projects/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { alert('Deleted'); loadProjects(); }
};

// ========== SKILLS ==========
async function loadSkills() {
    try {
        const skills = await fetch(`${API_URL}/skills`).then(r => r.json());
        document.getElementById('skillsList').innerHTML = skills.map(s => `
            <tr>
                <td><i class="${s.icon}" style="color:${s.color}"></i></td>
                <td>${s.name}</td>
                <td>${s.level}%</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteSkill('${s._id}')">Del</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('skillsList').innerHTML = '<tr><td colspan="4">Error loading skills</td></tr>';
    }
}

window.showAddSkillModal = () => {
    document.getElementById('skillModal').classList.add('active');
};

document.getElementById('skillForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const skill = {
        name: document.getElementById('skillName').value,
        level: parseInt(document.getElementById('skillLevel').value),
        icon: document.getElementById('skillIcon').value,
        color: document.getElementById('skillColor').value
    };
    const res = await fetchWithAuth(`${API_URL}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
    });
    const data = await res.json();
    if (data.success) {
        alert('Skill added');
        document.getElementById('skillModal').classList.remove('active');
        e.target.reset();
        loadSkills();
    }
});

window.deleteSkill = async (id) => {
    if (!confirm('Delete?')) return;
    const res = await fetchWithAuth(`${API_URL}/skills/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { alert('Deleted'); loadSkills(); }
};

// ========== SOCIAL LINKS ==========
async function loadSocial() {
    try {
        const profile = await fetch(`${API_URL}/profile`).then(r => r.json());
        document.getElementById('socialGithub').value = profile.socialLinks?.github || '';
        document.getElementById('socialLinkedin').value = profile.socialLinks?.linkedin || '';
        document.getElementById('socialTwitter').value = profile.socialLinks?.twitter || '';
        document.getElementById('socialInstagram').value = profile.socialLinks?.instagram || '';
        document.getElementById('socialFacebook').value = profile.socialLinks?.facebook || '';
        document.getElementById('socialYoutube').value = profile.socialLinks?.youtube || '';
    } catch (error) {
        alert('Error loading social links');
    }
}

document.getElementById('socialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const socialLinks = {
        github: document.getElementById('socialGithub').value,
        linkedin: document.getElementById('socialLinkedin').value,
        twitter: document.getElementById('socialTwitter').value,
        instagram: document.getElementById('socialInstagram').value,
        facebook: document.getElementById('socialFacebook').value,
        youtube: document.getElementById('socialYoutube').value
    };
    const res = await fetchWithAuth(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks })
    });
    const data = await res.json();
    alert(data.success ? 'Social links updated!' : 'Error');
});

// ========== MESSAGES ==========
async function loadMessages() {
    try {
        const messages = await fetchWithAuth(`${API_URL}/messages`).then(r => r.json());
        document.getElementById('messagesList').innerHTML = messages.map(m => `
            <tr class="${m.read ? '' : 'unread'}">
                <td>${m.read ? 'Read' : 'New'}</td>
                <td>${m.name}</td>
                <td>${m.email}</td>
                <td>${new Date(m.createdAt).toLocaleString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewMessage('${m._id}')">View</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMessage('${m._id}')">Del</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('messagesList').innerHTML = '<tr><td colspan="5">Error loading messages</td></tr>';
    }
}

window.viewMessage = async (id) => {
    await fetchWithAuth(`${API_URL}/messages/${id}/read`, { method: 'PUT' });
    alert('Message marked as read');
    loadMessages();
};

window.deleteMessage = async (id) => {
    if (!confirm('Delete?')) return;
    await fetchWithAuth(`${API_URL}/messages/${id}`, { method: 'DELETE' });
    loadMessages();
};

// ========== TESTIMONIALS ==========
async function loadTestimonials() {
    try {
        const testimonials = await fetch(`${API_URL}/testimonials`).then(r => r.json());
        document.getElementById('testimonialsList').innerHTML = testimonials.map(t => `
            <tr>
                <td><img src="${t.image ? BASE_URL + t.image : 'https://via.placeholder.com/50'}" style="width:50px;height:50px;border-radius:50%"></td>
                <td>${t.name}</td>
                <td>${t.position || '-'}</td>
                <td>${t.company || '-'}</td>
                <td>${'⭐'.repeat(t.rating)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t._id}')">Del</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        document.getElementById('testimonialsList').innerHTML = '<tr><td colspan="6">No testimonials</td></tr>';
    }
}

window.deleteTestimonial = async (id) => {
    if (!confirm('Delete?')) return;
    await fetchWithAuth(`${API_URL}/testimonials/${id}`, { method: 'DELETE' });
    loadTestimonials();
};

// ========== LOGOUT ==========
window.logout = () => {
    localStorage.clear();
    window.location.href = 'index.html';
};

// ========== INITIAL LOAD ==========
loadDashboard();