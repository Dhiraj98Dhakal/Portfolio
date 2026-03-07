// ============================================
// admin.js - Complete Admin Panel Logic
// ============================================

// ========== CONFIGURATION ==========
const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

console.log('✅ Admin JS Loaded');
console.log('📍 API URL:', API_URL);
console.log('📍 BASE URL:', BASE_URL);

// ========== SECURITY CHECK ==========
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    console.log('🔐 Auth Check:', {
        hasToken: !!token,
        hasLoginTime: !!loginTime
    });
    
    if (!token || !loginTime) {
        console.log('❌ No token found');
        return false;
    }
    
    const loginTimestamp = parseInt(loginTime);
    if (isNaN(loginTimestamp) || loginTimestamp <= 0) {
        console.log('❌ Invalid login time');
        return false;
    }
    
    const now = Date.now();
    const timeDiff = now - loginTimestamp;
    
    if (timeDiff > SESSION_TIMEOUT) {
        console.log('❌ Session expired');
        return false;
    }
    
    console.log('✅ Authentication valid');
    return true;
}

function redirectToLogin(error = 'unauthorized') {
    console.log(`🔄 Redirecting to login: ${error}`);
    localStorage.clear();
    window.location.replace(`index.html?error=${error}`);
}

// Initial security check
(function() {
    console.log('🚀 Admin Dashboard Loading...');
    
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!token || !loginTime) {
        console.log('❌ No token found - redirecting');
        redirectToLogin('unauthorized');
        return;
    }
    
    if (!checkAuth()) {
        redirectToLogin('session_expired');
    } else {
        console.log('✅ Authentication passed');
    }
})();

// ========== API HELPER ==========
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    if (!checkAuth()) {
        redirectToLogin('session_expired');
        throw new Error('Not authenticated');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    };
    
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            console.log('❌ API returned 401');
            redirectToLogin('session_expired');
            throw new Error('Session expired');
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ========== UTILITY FUNCTIONS ==========
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                         type === 'error' ? 'fa-exclamation-circle' : 
                         type === 'warning' ? 'fa-exclamation-triangle' : 
                         'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

// ========== SIDEBAR TOGGLE ==========
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const mainContent = document.getElementById('mainContent');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// ========== SECTION NAVIGATION ==========
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

window.showSection = function(sectionId) {
    sections.forEach(s => s.style.display = 'none');
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) selectedSection.style.display = 'block';
    
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    const titles = {
        'dashboard': { title: 'Dashboard', desc: 'Overview of your portfolio' },
        'profile': { title: 'Profile Settings', desc: 'Manage your personal information' },
        'projects': { title: 'Projects', desc: 'Manage your projects' },
        'add-project': { title: 'Add Project', desc: 'Create a new project' },
        'skills': { title: 'Skills', desc: 'Manage your skills' },
        'social': { title: 'Social Links', desc: 'Update your social media links' },
        'settings': { title: 'Site Settings', desc: 'Configure your website' },
        'uploads': { title: 'File Manager', desc: 'Manage uploaded files' },
        'messages': { title: 'Messages', desc: 'View contact messages' },
        'backup': { title: 'Backup & Restore', desc: 'Backup your data' }
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionId]?.title || 'Dashboard';
    document.getElementById('pageDescription').textContent = titles[sectionId]?.desc || '';
    
    // Load section data
    switch(sectionId) {
        case 'dashboard': loadDashboard(); break;
        case 'profile': loadProfile(); break;
        case 'projects': loadProjects(); break;
        case 'skills': loadSkills(); break;
        case 'social': loadSocialLinks(); break;
        case 'settings': loadSettings(); break;
        case 'uploads': loadUploads(); break;
        case 'messages': loadMessages(); break;
        case 'backup': loadBackupInfo(); break;
    }
};

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// ========== DASHBOARD ==========
async function loadDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = '<div class="loading">Loading stats...</div>';
    
    try {
        const [projects, skills, uploadsRes, messagesRes] = await Promise.all([
            fetchWithAuth(`${API_URL}/projects`).then(r => r.json()).catch(() => []),
            fetchWithAuth(`${API_URL}/skills`).then(r => r.json()).catch(() => []),
            fetchWithAuth(`${API_URL}/uploads`).catch(() => ({ files: [] })),
            fetchWithAuth(`${API_URL}/messages`).catch(() => [])
        ]);
        
        const uploads = uploadsRes.files ? uploadsRes : { files: [] };
        const messages = Array.isArray(messagesRes) ? messagesRes : [];
        
        const featuredCount = projects.filter(p => p.featured).length;
        const techSet = new Set();
        projects.forEach(p => p.technologies?.forEach(t => techSet.add(t)));
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-project-diagram"></i></div>
                <div class="stat-value">${projects.length}</div>
                <div class="stat-label">Total Projects</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <div class="stat-value">${featuredCount}</div>
                <div class="stat-label">Featured</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-code"></i></div>
                <div class="stat-value">${skills.length}</div>
                <div class="stat-label">Skills</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-images"></i></div>
                <div class="stat-value">${uploads.files?.length || 0}</div>
                <div class="stat-label">Uploads</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                <div class="stat-value">${messages.length}</div>
                <div class="stat-label">Messages</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-tags"></i></div>
                <div class="stat-value">${techSet.size}</div>
                <div class="stat-label">Technologies</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Dashboard error:', error);
        statsContainer.innerHTML = '<div class="error">Error loading dashboard</div>';
    }
}

// ========== PROFILE MANAGEMENT ==========
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();

        setValue('profileName', profile.name);
        setValue('profileTitle', profile.title);
        setValue('profileBio', profile.bio);
        setValue('profileAboutText', profile.aboutText);
        setValue('profileEmail', profile.email);
        setValue('profilePhone', profile.phone);
        setValue('profileLocation', profile.location);
        setValue('profileCountry', profile.country || 'Nepal');
        setValue('profileExperience', profile.experience || '2+');
        setValue('profileInitials', profile.initials || 'D');
        setValue('profileEducation', profile.education || 'BICTE (2022 - Present)');
        setValue('profileWebsite', profile.website || '');
        setValue('profileCvLink', profile.cvLink || '');
        setValue('profileShortBio', profile.shortBio || '');
        setValue('profileContactTitle', profile.contactTitle || '');
        setValue('profileContactText', profile.contactText || '');

        if (profile.profileImage) {
            showImagePreview('profileImagePreview', `${BASE_URL}${profile.profileImage}`);
        }
        if (profile.aboutImage) {
            showImagePreview('aboutImagePreview', `${BASE_URL}${profile.aboutImage}`);
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile', 'error');
    }
}

function showImagePreview(id, src) {
    const preview = document.getElementById(id);
    if (preview) {
        preview.src = src;
        preview.style.display = 'block';
    }
}

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    const fields = [
        'name', 'title', 'bio', 'aboutText', 'email', 'phone', 
        'location', 'country', 'experience', 'initials', 'education',
        'website', 'cvLink', 'shortBio', 'contactTitle', 'contactText'
    ];
    
    fields.forEach(field => {
        const elementId = `profile${field.charAt(0).toUpperCase() + field.slice(1)}`;
        const value = document.getElementById(elementId)?.value;
        if (value) formData.append(field, value);
    });

    const profileImage = document.getElementById('profileImage')?.files[0];
    if (profileImage) formData.append('profileImage', profileImage);
    
    const aboutImage = document.getElementById('aboutImage')?.files[0];
    if (aboutImage) formData.append('aboutImage', aboutImage);

    try {
        const response = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Profile updated successfully!');
            loadProfile();
        }
    } catch (error) {
        showAlert('Error updating profile: ' + error.message, 'error');
    }
});

['profileImage', 'aboutImage'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                const preview = document.getElementById(id + 'Preview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    });
});

// ========== PROJECTS MANAGEMENT ==========
async function loadProjects() {
    const tbody = document.getElementById('projectsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading projects...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No projects found</td></tr>';
            return;
        }

        tbody.innerHTML = projects.map(p => `
            <tr>
                <td>
                    <img src="${p.image ? `${BASE_URL}${p.image}` : 'https://via.placeholder.com/50'}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:5px;"
                         onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.description.substring(0, 50))}...</td>
                <td>${p.technologies?.slice(0,2).join(', ') || ''}</td>
                <td>
                    <span class="badge ${p.featured ? 'badge-success' : 'badge-warning'}">
                        ${p.featured ? 'Featured' : 'Regular'}
                    </span>
                </td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" onclick="editProject('${p._id || p.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProject('${p._id || p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading projects:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center error">Error loading projects</td></tr>';
    }
}

document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', document.getElementById('projectTitle')?.value || '');
    formData.append('description', document.getElementById('projectDescription')?.value || '');
    formData.append('technologies', document.getElementById('projectTechnologies')?.value || '');
    formData.append('github', document.getElementById('projectGithub')?.value || '');
    formData.append('demo', document.getElementById('projectDemo')?.value || '');
    formData.append('featured', document.getElementById('projectFeatured')?.checked || false);

    const imageFile = document.getElementById('projectImage')?.files[0];
    if (imageFile) formData.append('image', imageFile);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/projects`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Project added successfully!');
            e.target.reset();
            document.getElementById('projectImagePreview').style.display = 'none';
            showSection('projects');
            loadProjects();
        }
    } catch (error) {
        showAlert('Error adding project', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

document.getElementById('projectImage')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('projectImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

window.editProject = async function(id) {
    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();
        const project = projects.find(p => (p._id == id || p.id == id));

        if (!project) {
            showAlert('Project not found', 'error');
            return;
        }

        setValue('editProjectId', project._id || project.id);
        setValue('editProjectTitle', project.title);
        setValue('editProjectDescription', project.description);
        setValue('editProjectTechnologies', project.technologies?.join(', ') || '');
        setValue('editProjectGithub', project.github || '');
        setValue('editProjectDemo', project.demo || '');
        
        const featuredCheck = document.getElementById('editProjectFeatured');
        if (featuredCheck) featuredCheck.checked = project.featured || false;

        if (project.image) {
            const preview = document.getElementById('editProjectImagePreview');
            preview.src = project.image.startsWith('http') ? project.image : `${BASE_URL}${project.image}`;
            preview.style.display = 'block';
        }

        document.getElementById('editProjectModal').classList.add('active');
        
    } catch (error) {
        console.error('Error loading project:', error);
        showAlert('Error loading project', 'error');
    }
};

document.getElementById('editProjectForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editProjectId')?.value;
    const formData = new FormData();
    formData.append('title', document.getElementById('editProjectTitle')?.value || '');
    formData.append('description', document.getElementById('editProjectDescription')?.value || '');
    formData.append('technologies', document.getElementById('editProjectTechnologies')?.value || '');
    formData.append('github', document.getElementById('editProjectGithub')?.value || '');
    formData.append('demo', document.getElementById('editProjectDemo')?.value || '');
    formData.append('featured', document.getElementById('editProjectFeatured')?.checked || false);

    const imageFile = document.getElementById('editProjectImage')?.files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        const response = await fetchWithAuth(`${API_URL}/projects/${id}`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Project updated successfully!');
            closeModal('editProjectModal');
            loadProjects();
        }
    } catch (error) {
        showAlert('Error updating project', 'error');
    }
});

window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/projects/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Project deleted successfully!');
            loadProjects();
        }
    } catch (error) {
        showAlert('Error deleting project', 'error');
    }
};

// ========== SKILLS MANAGEMENT ==========
async function loadSkills() {
    const tbody = document.getElementById('skillsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading skills...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();

        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No skills found</td></tr>';
            return;
        }

        tbody.innerHTML = skills.map(s => `
            <tr>
                <td><i class="${s.icon}" style="color: ${s.color}; font-size: 1.5rem;"></i></td>
                <td>${escapeHtml(s.name)}</td>
                <td>${s.level}%</td>
                <td><span class="badge badge-info">${s.category || 'General'}</span></td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" onclick="editSkill('${s._id || s.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteSkill('${s._id || s.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading skills:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center error">Error loading skills</td></tr>';
    }
}

window.showAddSkillModal = function() {
    document.getElementById('skillModal').classList.add('active');
};

document.getElementById('skillForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newSkill = {
        name: document.getElementById('skillName')?.value,
        level: parseInt(document.getElementById('skillLevel')?.value),
        icon: document.getElementById('skillIcon')?.value,
        color: document.getElementById('skillColor')?.value,
        category: document.getElementById('skillCategory')?.value
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSkill)
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Skill added successfully!');
            closeModal('skillModal');
            loadSkills();
            e.target.reset();
        }
    } catch (error) {
        showAlert('Error adding skill', 'error');
    }
});

window.editSkill = async function(id) {
    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();
        const skill = skills.find(s => (s._id == id || s.id == id));

        if (!skill) return;

        setValue('editSkillId', skill._id || skill.id);
        setValue('editSkillName', skill.name);
        setValue('editSkillLevel', skill.level);
        setValue('editSkillIcon', skill.icon);
        
        const colorInput = document.getElementById('editSkillColor');
        if (colorInput) colorInput.value = skill.color;

        document.getElementById('editSkillModal').classList.add('active');
        
    } catch (error) {
        showAlert('Error loading skill', 'error');
    }
};

document.getElementById('editSkillForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editSkillId')?.value;
    const updatedSkill = {
        name: document.getElementById('editSkillName')?.value,
        level: parseInt(document.getElementById('editSkillLevel')?.value),
        icon: document.getElementById('editSkillIcon')?.value,
        color: document.getElementById('editSkillColor')?.value
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/skills/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSkill)
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Skill updated successfully!');
            closeModal('editSkillModal');
            loadSkills();
        }
    } catch (error) {
        showAlert('Error updating skill', 'error');
    }
});

window.deleteSkill = async function(id) {
    if (!confirm('Delete this skill?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/skills/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Skill deleted successfully!');
            loadSkills();
        }
    } catch (error) {
        showAlert('Error deleting skill', 'error');
    }
};

// ============================================
// SOCIAL LINKS - FIXED VERSION
// ============================================

/**
 * Load social links
 */
async function loadSocialLinks() {
    try {
        console.log('📥 Loading social links...');
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();
        const links = profile.socialLinks || {};
        
        console.log('📥 Received social links:', links);

        // सबै platforms को लागि set गर्ने
        setValue('socialGithub', links.github || '');
        setValue('socialLinkedin', links.linkedin || '');
        setValue('socialTwitter', links.twitter || '');
        setValue('socialInstagram', links.instagram || '');
        setValue('socialFacebook', links.facebook || '');
        setValue('socialYoutube', links.youtube || '');
        
    } catch (error) {
        console.error('❌ Error loading social links:', error);
        showAlert('Error loading social links', 'error');
    }
}

// Social form submit - FIXED
document.getElementById('socialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // सबै social links collect गर्ने
    const socialLinks = {
        github: document.getElementById('socialGithub')?.value || '',
        linkedin: document.getElementById('socialLinkedin')?.value || '',
        twitter: document.getElementById('socialTwitter')?.value || '',
        instagram: document.getElementById('socialInstagram')?.value || '',
        facebook: document.getElementById('socialFacebook')?.value || '',
        youtube: document.getElementById('socialYoutube')?.value || ''
    };

    console.log('📤 Sending social links:', socialLinks);

    try {
        const response = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ socialLinks })
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Social links updated successfully!');
            console.log('✅ Social links update successful:', data);
            loadSocialLinks(); // Reload to confirm
        } else {
            showAlert('Error: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('❌ Social links update error:', error);
        showAlert('Error updating social links: ' + error.message, 'error');
    }
});

// ========== SETTINGS ==========
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();

        setValue('siteTitle', settings.siteTitle);
        setValue('siteDescription', settings.siteDescription);
        setValue('adminEmail', settings.adminEmail);
        
        const maintenanceCheck = document.getElementById('maintenanceMode');
        if (maintenanceCheck) maintenanceCheck.checked = settings.maintenanceMode || false;
        
        setValue('copyrightText', settings.copyrightText || 'All rights reserved');
        setValue('siteLanguage', settings.siteLanguage || 'en');
        
        if (settings.favicon) {
            showImagePreview('faviconPreview', `${BASE_URL}${settings.favicon}`);
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('siteTitle', document.getElementById('siteTitle')?.value || '');
    formData.append('siteDescription', document.getElementById('siteDescription')?.value || '');
    formData.append('adminEmail', document.getElementById('adminEmail')?.value || '');
    formData.append('maintenanceMode', document.getElementById('maintenanceMode')?.checked || false);
    formData.append('copyrightText', document.getElementById('copyrightText')?.value || 'All rights reserved');
    formData.append('siteLanguage', document.getElementById('siteLanguage')?.value || 'en');

    const faviconFile = document.getElementById('favicon')?.files[0];
    if (faviconFile) formData.append('favicon', faviconFile);

    try {
        const response = await fetchWithAuth(`${API_URL}/settings`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Settings updated successfully!');
            loadSettings();
        }
    } catch (error) {
        showAlert('Error updating settings', 'error');
    }
});

// ========== UPLOADS MANAGER ==========
async function loadUploads() {
    const container = document.getElementById('uploadsList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading uploads...</div>';

    try {
        const response = await fetchWithAuth(`${API_URL}/uploads`);
        const data = await response.json();

        if (!data.files || data.files.length === 0) {
            container.innerHTML = '<div class="text-center">No files found</div>';
            return;
        }

        container.innerHTML = data.files.map(file => `
            <div class="upload-item">
                <img src="${BASE_URL}/uploads/${file}" onerror="this.src='https://via.placeholder.com/150'">
                <p><small>${file}</small></p>
                <button class="btn btn-danger btn-sm w-100" onclick="deleteUpload('${file}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading uploads:', error);
        container.innerHTML = '<div class="text-center error">Error loading uploads</div>';
    }
}

window.deleteUpload = async function(filename) {
    if (!confirm('Delete this file?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/uploads/${filename}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('File deleted successfully!');
            loadUploads();
        }
    } catch (error) {
        showAlert('Error deleting file', 'error');
    }
};

// ========== BACKUP & RESTORE ==========
async function loadBackupInfo() {
    const lastBackupEl = document.getElementById('lastBackup');
    if (lastBackupEl) {
        const lastBackup = localStorage.getItem('lastBackup');
        lastBackupEl.textContent = lastBackup ? new Date(parseInt(lastBackup)).toLocaleString() : 'Never';
    }
}

window.backupData = async function() {
    try {
        const response = await fetchWithAuth(`${API_URL}/backup`);
        const data = await response.json();

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        localStorage.setItem('lastBackup', Date.now());
        document.getElementById('lastBackup').textContent = new Date().toLocaleString();
        
        showAlert('Backup created successfully!');
        
    } catch (error) {
        console.error('Backup error:', error);
        showAlert('Error creating backup', 'error');
    }
};

window.restoreData = async function() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput?.files[0];
    
    if (!file) {
        showAlert('Please select a backup file', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            
            const response = await fetchWithAuth(`${API_URL}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backup)
            });

            const data = await response.json();
            
            if (data.success) {
                showAlert('Data restored successfully!');
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            showAlert('Error restoring data: Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
};

// ========== MESSAGES ==========
async function loadMessages() {
    const tbody = document.getElementById('messagesList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading messages...</td></tr>';

    try {
        const response = await fetchWithAuth(`${API_URL}/messages`);
        const messages = await response.json();

        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No messages yet</td></tr>';
            return;
        }

        tbody.innerHTML = messages.map(m => `
            <tr class="${m.read ? '' : 'unread'}">
                <td>
                    ${!m.read ? '<span class="badge badge-danger">New</span>' : '<span class="badge badge-success">Read</span>'}
                </td>
                <td>${escapeHtml(m.name || 'Anonymous')}</td>
                <td><a href="mailto:${m.email}">${escapeHtml(m.email)}</a></td>
                <td>${escapeHtml(m.subject || 'No Subject')}</td>
                <td>${formatDate(m.createdAt || m.date)}</td>
                <td class="action-btns">
                    <button class="action-btn view-btn" onclick="viewMessage('${m._id || m.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteMessage('${m._id || m.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        await updateUnreadCount();
        
    } catch (error) {
        console.error('Error loading messages:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center error">Error loading messages</td></tr>';
    }
}

// ============================================
// VIEW MESSAGE DETAILS - FIXED
// ============================================
window.viewMessage = async function(id) {
    try {
        console.log('👁️ Viewing message ID:', id);
        
        if (!id) {
            showAlert('Invalid message ID', 'error');
            return;
        }
        
        // First, try to fetch the specific message
        const response = await fetchWithAuth(`${API_URL}/messages/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showAlert('Message not found. It may have been deleted.', 'error');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
        }
        
        const message = await response.json();
        console.log('📧 Message details:', message);

        // Mark as read if not already read
        if (!message.read) {
            try {
                await fetchWithAuth(`${API_URL}/messages/${id}/read`, { method: 'PUT' });
                message.read = true;
                updateUnreadCount();
                loadMessages(); // Refresh the list
            } catch (e) {
                console.log('Error marking as read:', e);
            }
        }

        // Display message details
        const detailDiv = document.getElementById('messageDetail');
        detailDiv.innerHTML = `
            <div class="message-detail">
                <div class="detail-row">
                    <strong>From:</strong> 
                    <span>${escapeHtml(message.name || 'Anonymous')} (${escapeHtml(message.email || 'No email')})</span>
                </div>
                <div class="detail-row">
                    <strong>Subject:</strong> 
                    <span>${escapeHtml(message.subject || 'No Subject')}</span>
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> 
                    <span>${formatDate(message.createdAt || message.date)}</span>
                </div>
                <div class="detail-row">
                    <strong>Message:</strong>
                    <div class="message-content">${escapeHtml(message.message || 'No message content').replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;

        document.getElementById('messageModal').classList.add('active');
        window.currentMessageId = id;
        window.currentMessageEmail = message.email;
        
    } catch (error) {
        console.error('❌ Error loading message:', error);
        showAlert('Error loading message: ' + error.message, 'error');
    }
};

window.replyToMessage = function() {
    if (window.currentMessageEmail) {
        window.location.href = `mailto:${window.currentMessageEmail}`;
    }
};

window.deleteCurrentMessage = async function() {
    if (window.currentMessageId) {
        await deleteMessage(window.currentMessageId);
        closeMessageModal();
    }
};

window.closeMessageModal = function() {
    document.getElementById('messageModal').classList.remove('active');
    window.currentMessageId = null;
    window.currentMessageEmail = null;
};

window.refreshMessages = function() {
    loadMessages();
    showAlert('Messages refreshed', 'info');
};

window.deleteMessage = async function(id) {
    if (!confirm('Delete this message?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/messages/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Message deleted!');
            loadMessages();
            updateUnreadCount();
        }
    } catch (error) {
        showAlert('Error deleting message', 'error');
    }
};

async function updateUnreadCount() {
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/unread/count`);
        const data = await response.json();
        
        const badge = document.getElementById('unread-badge');
        if (badge) {
            if (data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
}

// ========== MESSAGE FILTERS ==========
document.querySelectorAll('[data-message-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-message-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.messageFilter;
        const rows = document.querySelectorAll('#messagesList tr');
        
        rows.forEach(row => {
            if (filter === 'all') {
                row.style.display = '';
            } else if (filter === 'unread') {
                row.style.display = row.classList.contains('unread') ? '' : 'none';
            } else if (filter === 'read') {
                row.style.display = !row.classList.contains('unread') ? '' : 'none';
            }
        });
    });
});

// ========== MODAL FUNCTIONS ==========
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

window.closeModal = closeModal;

// ========== LOGOUT ==========
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html?loggedout=true';
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// ========== SESSION MONITORING ==========
setInterval(() => {
    if (!checkAuth()) {
        console.log('Session expired - logging out');
        redirectToLogin('session_expired');
    }
}, 60000);

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Admin Dashboard Initialized');
    
    if (!checkAuth()) {
        redirectToLogin('session_expired');
        return;
    }
    
    showSection('dashboard');
    
    await loadDashboard();
    await updateUnreadCount();
    
    const adminUser = localStorage.getItem('adminUser') || 'Admin';
    document.getElementById('adminUsername').textContent = adminUser;
    
    console.log('✅ Admin Panel Ready');
});