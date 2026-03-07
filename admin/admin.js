const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';

// Check auth
const token = localStorage.getItem('adminToken');
const loginTime = localStorage.getItem('adminLoginTime');
if (!token || !loginTime || (Date.now() - parseInt(loginTime) > 24*60*60*1000)) {
    localStorage.clear();
    window.location.href = 'index.html';
}

async function fetchWithAuth(url, options = {}) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    const res = await fetch(url, options);
    if (res.status === 401) window.location.href = 'index.html';
    return res;
}

// Section navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.getElementById(link.dataset.section + '-section').style.display = 'block';
        document.getElementById('pageTitle').textContent = link.textContent.trim();
        
        // Load section data
        if (link.dataset.section === 'dashboard') loadDashboard();
        else if (link.dataset.section === 'profile') loadProfile();
        else if (link.dataset.section === 'projects') loadProjects();
        else if (link.dataset.section === 'skills') loadSkills();
        else if (link.dataset.section === 'social') loadSocial();
        else if (link.dataset.section === 'messages') loadMessages();
    });
});

// Dashboard
async function loadDashboard() {
    const [projects, skills, messages] = await Promise.all([
        fetch(`${API_URL}/projects`).then(r => r.json()),
        fetch(`${API_URL}/skills`).then(r => r.json()),
        fetchWithAuth(`${API_URL}/messages`).then(r => r.json()).catch(() => [])
    ]);
    document.getElementById('dashboard-stats').innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
            <div><h3>${projects.length}</h3><p>Projects</p></div>
            <div><h3>${skills.length}</h3><p>Skills</p></div>
            <div><h3>${messages.length}</h3><p>Messages</p></div>
        </div>
    `;
}

// Profile
async function loadProfile() {
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
    
    const img = document.getElementById('profileImage').files[0];
    if (img) formData.append('profileImage', img);
    
    const res = await fetchWithAuth(`${API_URL}/profile`, { method: 'PUT', body: formData });
    const data = await res.json();
    alert(data.success ? 'Profile updated' : 'Error');
});

// Projects
async function loadProjects() {
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
    
    const img = document.getElementById('projectImage').files[0];
    if (img) formData.append('image', img);
    
    await fetchWithAuth(`${API_URL}/projects`, { method: 'POST', body: formData });
    alert('Project added');
    showSection('projects');
    loadProjects();
});

window.deleteProject = async (id) => {
    if (confirm('Delete?')) {
        await fetchWithAuth(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        loadProjects();
    }
};

// Skills
async function loadSkills() {
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
}

window.showAddSkillModal = () => document.getElementById('skillModal').classList.add('active');

document.getElementById('skillForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const skill = {
        name: document.getElementById('skillName').value,
        level: parseInt(document.getElementById('skillLevel').value),
        icon: document.getElementById('skillIcon').value,
        color: document.getElementById('skillColor').value
    };
    await fetchWithAuth(`${API_URL}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
    });
    document.getElementById('skillModal').classList.remove('active');
    loadSkills();
});

window.deleteSkill = async (id) => {
    if (confirm('Delete?')) {
        await fetchWithAuth(`${API_URL}/skills/${id}`, { method: 'DELETE' });
        loadSkills();
    }
};

// Social Links
async function loadSocial() {
    const profile = await fetch(`${API_URL}/profile`).then(r => r.json());
    document.getElementById('socialGithub').value = profile.socialLinks?.github || '';
    document.getElementById('socialLinkedin').value = profile.socialLinks?.linkedin || '';
    document.getElementById('socialTwitter').value = profile.socialLinks?.twitter || '';
    document.getElementById('socialInstagram').value = profile.socialLinks?.instagram || '';
    document.getElementById('socialFacebook').value = profile.socialLinks?.facebook || '';
    document.getElementById('socialYoutube').value = profile.socialLinks?.youtube || '';
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
    await fetchWithAuth(`${API_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks })
    });
    alert('Social links updated');
});

// Messages
async function loadMessages() {
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
}


// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

// Load testimonials
async function loadTestimonials() {
    const tbody = document.getElementById('testimonialsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading testimonials...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (testimonials.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No testimonials yet</td></tr>';
            return;
        }

        tbody.innerHTML = testimonials.map(t => `
            <tr>
                <td>
                    <img src="${t.image ? BASE_URL + t.image : 'https://via.placeholder.com/50'}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:50%;">
                </td>
                <td>${t.name}</td>
                <td>${t.position || '-'}</td>
                <td>${t.company || '-'}</td>
                <td>${'⭐'.repeat(t.rating)}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editTestimonial('${t._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t._id}')">Del</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center error">Error loading testimonials</td></tr>';
    }
}

// Show add testimonial modal
window.showAddTestimonialModal = function() {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'testimonialModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Testimonial</h3>
            <form id="testimonialForm">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="testimonialName" required>
                </div>
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" id="testimonialPosition">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="testimonialCompany">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="testimonialContent" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Rating (1-5)</label>
                    <input type="number" id="testimonialRating" min="1" max="5" value="5">
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <input type="file" id="testimonialImage" accept="image/*">
                </div>
                <button type="submit" class="btn btn-primary">Add</button>
                <button type="button" class="btn btn-danger" onclick="closeTestimonialModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add submit handler
    document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('testimonialName').value);
        formData.append('position', document.getElementById('testimonialPosition').value);
        formData.append('company', document.getElementById('testimonialCompany').value);
        formData.append('content', document.getElementById('testimonialContent').value);
        formData.append('rating', document.getElementById('testimonialRating').value);
        
        const img = document.getElementById('testimonialImage').files[0];
        if (img) formData.append('image', img);
        
        const res = await fetchWithAuth(`${API_URL}/testimonials`, {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        if (data.success) {
            alert('Testimonial added');
            closeTestimonialModal();
            loadTestimonials();
        } else {
            alert('Error adding testimonial');
        }
    });
};

// Close testimonial modal
window.closeTestimonialModal = function() {
    const modal = document.getElementById('testimonialModal');
    if (modal) modal.remove();
};

// Edit testimonial
window.editTestimonial = async function(id) {
    const res = await fetch(`${API_URL}/testimonials/${id}`);
    const t = await res.json();
    
    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editTestimonialModal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Edit Testimonial</h3>
            <form id="editTestimonialForm">
                <input type="hidden" id="editTestimonialId" value="${t._id}">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="editTestimonialName" value="${t.name}" required>
                </div>
                <div class="form-group">
                    <label>Position</label>
                    <input type="text" id="editTestimonialPosition" value="${t.position || ''}">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="editTestimonialCompany" value="${t.company || ''}">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="editTestimonialContent" rows="3" required>${t.content}</textarea>
                </div>
                <div class="form-group">
                    <label>Rating (1-5)</label>
                    <input type="number" id="editTestimonialRating" min="1" max="5" value="${t.rating}">
                </div>
                <div class="form-group">
                    <label>Image</label>
                    <input type="file" id="editTestimonialImage" accept="image/*">
                </div>
                <button type="submit" class="btn btn-primary">Update</button>
                <button type="button" class="btn btn-danger" onclick="closeEditTestimonialModal()">Cancel</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Add submit handler
    document.getElementById('editTestimonialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('editTestimonialId').value;
        const formData = new FormData();
        formData.append('name', document.getElementById('editTestimonialName').value);
        formData.append('position', document.getElementById('editTestimonialPosition').value);
        formData.append('company', document.getElementById('editTestimonialCompany').value);
        formData.append('content', document.getElementById('editTestimonialContent').value);
        formData.append('rating', document.getElementById('editTestimonialRating').value);
        
        const img = document.getElementById('editTestimonialImage').files[0];
        if (img) formData.append('image', img);
        
        const res = await fetchWithAuth(`${API_URL}/testimonials/${id}`, {
            method: 'PUT',
            body: formData
        });
        
        const data = await res.json();
        if (data.success) {
            alert('Testimonial updated');
            closeEditTestimonialModal();
            loadTestimonials();
        } else {
            alert('Error updating testimonial');
        }
    });
};

// Close edit testimonial modal
window.closeEditTestimonialModal = function() {
    const modal = document.getElementById('editTestimonialModal');
    if (modal) modal.remove();
};

// Delete testimonial
window.deleteTestimonial = async function(id) {
    if (!confirm('Delete this testimonial?')) return;
    
    const res = await fetchWithAuth(`${API_URL}/testimonials/${id}`, {
        method: 'DELETE'
    });
    
    const data = await res.json();
    if (data.success) {
        alert('Testimonial deleted');
        loadTestimonials();
    } else {
        alert('Error deleting testimonial');
    }
};

// Add to section navigation
// 'testimonials' case थप्नुहोस् showSection function मा
// case 'testimonials': loadTestimonials(); break;

window.viewMessage = async (id) => {
    await fetchWithAuth(`${API_URL}/messages/${id}/read`, { method: 'PUT' });
    loadMessages();
    alert('Message viewed');
};

window.deleteMessage = async (id) => {
    if (confirm('Delete?')) {
        await fetchWithAuth(`${API_URL}/messages/${id}`, { method: 'DELETE' });
        loadMessages();
    }
};

// Logout
window.logout = () => {
    localStorage.clear();
    window.location.href = 'index.html';
};

// Initial load
loadDashboard();