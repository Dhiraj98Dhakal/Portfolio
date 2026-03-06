// admin.js - Complete Admin Panel with Anime Theme Support
// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'https://portfolio-xqwu.onrender.com/api';
const BASE_URL = 'https://portfolio-xqwu.onrender.com';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

console.log('✨ Admin JS Loaded with API_URL:', API_URL);
console.log('✨ BASE_URL:', BASE_URL);

// ============================================
// SECURITY CHECK FUNCTIONS
// ============================================

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    console.log('🔐 Auth Check:', {
        hasToken: !!token,
        hasLoginTime: !!loginTime
    });
    
    if (!token || !loginTime) return false;
    
    const loginTimestamp = parseInt(loginTime);
    if (isNaN(loginTimestamp) || loginTimestamp <= 0) return false;
    
    const now = Date.now();
    if (now - loginTimestamp > SESSION_TIMEOUT) return false;
    
    return true;
}

function redirectToLogin(error = 'unauthorized') {
    console.log(`🔄 Redirecting to login: ${error}`);
    localStorage.clear();
    window.location.replace(`index.html?error=${error}`);
}

// Initial Security Check
(function() {
    console.log('🚀 Admin Dashboard Loading...');
    
    if (window.location.pathname.includes('dashboard.html')) {
        if (!checkAuth()) {
            redirectToLogin('session_expired');
        }
    }
})();

// ============================================
// API HELPER
// ============================================

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            console.log('❌ Session invalid');
            redirectToLogin('session_expired');
            throw new Error('Session expired');
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #ff6b9d, #c06bff)' :
                      type === 'error' ? 'linear-gradient(135deg, #ff4d4d, #ff0066)' :
                      type === 'warning' ? 'linear-gradient(135deg, #ffdb6b, #ff9f6b)' :
                      'linear-gradient(135deg, #6bc4ff, #c06bff)'};
        color: white;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        font-family: 'Poppins', sans-serif;
        border: 2px solid white;
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
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

function showImagePreview(id, src) {
    const preview = document.getElementById(id);
    if (preview) {
        preview.src = src;
        preview.style.display = 'block';
    }
}

// ============================================
// SIDEBAR TOGGLE
// ============================================
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const mainContent = document.getElementById('mainContent');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

// ============================================
// SECTION NAVIGATION
// ============================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');

window.showSection = function(sectionId) {
    sections.forEach(s => s.style.display = 'none');
    
    const selectedSection = document.getElementById(`${sectionId}-section`);
    if (selectedSection) selectedSection.style.display = 'block';
    
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    const titles = {
        'dashboard': { title: '🌸 Dashboard', desc: 'Welcome back, Admin-chan!' },
        'profile': { title: '👤 Profile', desc: 'Manage your kawaii profile' },
        'projects': { title: '📁 Projects', desc: 'Your awesome projects' },
        'add-project': { title: '✨ New Project', desc: 'Create something amazing' },
        'skills': { title: '⚡ Skills', desc: 'Your superpowers' },
        'social': { title: '💖 Social Links', desc: 'Connect with the world' },
        'testimonials': { title: '⭐ Testimonials', desc: 'What people say about you' },
        'settings': { title: '⚙️ Settings', desc: 'Customize your site' },
        'uploads': { title: '🖼️ Gallery', desc: 'Your uploaded images' },
        'messages': { title: '📧 Messages', desc: 'Fan mail from your admirers' },
        'backup': { title: '💾 Backup', desc: 'Save your data safely' }
    };
    
    if (pageTitle) pageTitle.textContent = titles[sectionId]?.title || 'Dashboard';
    if (pageDescription) pageDescription.textContent = titles[sectionId]?.desc || '';
    
    // Load section data
    switch(sectionId) {
        case 'dashboard': loadDashboard(); break;
        case 'profile': loadProfile(); break;
        case 'projects': loadProjects(); break;
        case 'skills': loadSkills(); break;
        case 'social': loadSocialLinks(); break;
        case 'testimonials': loadTestimonials(); break;
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

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = '<div class="loading">Loading kawaii data...</div>';
    
    try {
        const [projectsRes, skillsRes, messagesRes] = await Promise.all([
            fetch(`${API_URL}/projects`).catch(() => ({ json: () => [] })),
            fetch(`${API_URL}/skills`).catch(() => ({ json: () => [] })),
            fetchWithAuth(`${API_URL}/messages`).catch(() => ({ json: () => [] }))
        ]);
        
        const projects = await projectsRes.json().catch(() => []);
        const skills = await skillsRes.json().catch(() => []);
        const messages = await messagesRes.json().catch(() => []);
        
        const featuredCount = projects.filter(p => p.featured).length;
        const unreadCount = messages.filter(m => !m.read).length;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-folder-open"></i></div>
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
                <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                <div class="stat-value">${unreadCount}</div>
                <div class="stat-label">Unread Messages</div>
            </div>
        `;
    } catch (error) {
        console.error('Dashboard error:', error);
        statsContainer.innerHTML = '<div class="error">Error loading dashboard</div>';
    }
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();

        setValue('profileName', profile.name || '');
        setValue('profileTitle', profile.title || '');
        setValue('profileBio', profile.bio || '');
        setValue('profileEmail', profile.email || '');
        setValue('profilePhone', profile.phone || '');
        setValue('profileLocation', profile.location || '');
        setValue('profileCountry', profile.country || 'Nepal');
        setValue('profileExperience', profile.experience || '2+');
        setValue('profileInitials', profile.initials || 'D');

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

document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const fields = ['name', 'title', 'bio', 'email', 'phone', 'location', 'country', 'experience', 'initials'];
    
    fields.forEach(field => {
        const value = document.getElementById(`profile${field.charAt(0).toUpperCase() + field.slice(1)}`)?.value;
        if (value) formData.append(field, value);
    });

    const profileImage = document.getElementById('profileImage')?.files[0];
    if (profileImage) formData.append('profileImage', profileImage);
    
    const aboutImage = document.getElementById('aboutImage')?.files[0];
    if (aboutImage) formData.append('aboutImage', aboutImage);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Profile updated successfully! ✨');
            loadProfile();
        }
    } catch (error) {
        showAlert('Error updating profile', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Image preview handlers
document.getElementById('profileImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('profileImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('aboutImage')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('aboutImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// ============================================
// PROJECTS MANAGEMENT
// ============================================

async function loadProjects() {
    const tbody = document.getElementById('projectsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading projects...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();

        if (!projects || projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No projects found</td></tr>';
            return;
        }

        tbody.innerHTML = projects.map(p => `
            <tr>
                <td>
                    <img src="${p.image ? `${BASE_URL}${p.image}` : 'https://via.placeholder.com/50'}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:5px;">
                </td>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.description?.substring(0, 50))}${p.description?.length > 50 ? '...' : ''}</td>
                <td>${p.technologies?.slice(0,2).join(', ') || ''}${p.technologies?.length > 2 ? '...' : ''}</td>
                <td>
                    <span class="badge" style="background: ${p.featured ? '#ff6b9d' : '#c06bff'}">
                        ${p.featured ? '⭐ Featured' : '✨ Regular'}
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
            showAlert('Project added successfully! ✨');
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
            showAlert('Project updated successfully! ✨');
            closeModal('editProjectModal');
            loadProjects();
        }
    } catch (error) {
        showAlert('Error updating project', 'error');
    }
});

window.deleteProject = async function(id) {
    if (!confirm('Delete this project?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/projects/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Project deleted successfully!', 'success');
            loadProjects();
        }
    } catch (error) {
        showAlert('Error deleting project', 'error');
    }
};

// ============================================
// SKILLS MANAGEMENT
// ============================================

async function loadSkills() {
    const tbody = document.getElementById('skillsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading skills...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/skills`);
        const skills = await response.json();

        if (!skills || skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No skills found</td></tr>';
            return;
        }

        tbody.innerHTML = skills.map(s => `
            <tr>
                <td><i class="${s.icon}" style="color: ${s.color}; font-size: 1.5rem;"></i></td>
                <td>${escapeHtml(s.name)}</td>
                <td>${s.level}%</td>
                <td><span class="badge" style="background: #6bc4ff">${s.category || 'General'}</span></td>
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
            showAlert('Skill added successfully! ✨');
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
            showAlert('Skill updated successfully! ✨');
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
            showAlert('Skill deleted successfully!', 'success');
            loadSkills();
        }
    } catch (error) {
        showAlert('Error deleting skill', 'error');
    }
};

// ============================================
// SOCIAL LINKS - FIXED VERSION
// ============================================

async function loadSocialLinks() {
    const socialGrid = document.getElementById('socialGrid');
    if (!socialGrid) return;
    
    socialGrid.innerHTML = '<div class="loading">Loading social links...</div>';

    try {
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();
        const links = profile.socialLinks || {};

        if (Object.keys(links).length === 0) {
            // Default social links
            const defaultLinks = {
                github: 'https://github.com/dhiraj',
                linkedin: 'https://linkedin.com/in/dhiraj',
                twitter: 'https://twitter.com/dhiraj',
                instagram: 'https://instagram.com/dhiraj'
            };
            
            socialGrid.innerHTML = Object.entries(defaultLinks).map(([platform, url]) => `
                <div class="social-card" data-platform="${platform}">
                    <i class="fab fa-${platform}"></i>
                    <div class="platform">${platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                    <input type="url" class="social-url" value="${url}" placeholder="URL">
                    <div class="social-actions">
                        <button class="social-save" onclick="saveSocialLink('${platform}')">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="social-delete" onclick="deleteSocialLink('${platform}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            socialGrid.innerHTML = Object.entries(links).map(([platform, url]) => `
                <div class="social-card" data-platform="${platform}">
                    <i class="fab fa-${platform}"></i>
                    <div class="platform">${platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                    <input type="url" class="social-url" value="${url}" placeholder="URL">
                    <div class="social-actions">
                        <button class="social-save" onclick="saveSocialLink('${platform}')">
                            <i class="fas fa-save"></i>
                        </button>
                        <button class="social-delete" onclick="deleteSocialLink('${platform}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading social links:', error);
        socialGrid.innerHTML = '<div class="text-center error">Error loading social links</div>';
    }
}

window.saveSocialLink = async function(platform) {
    const card = document.querySelector(`[data-platform="${platform}"]`);
    const url = card.querySelector('.social-url').value;
    
    try {
        const response = await fetchWithAuth(`${API_URL}/profile`);
        const profile = await response.json();
        
        const socialLinks = profile.socialLinks || {};
        socialLinks[platform] = url;
        
        const updateResponse = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socialLinks })
        });
        
        const data = await updateResponse.json();
        if (data.success) {
            showAlert('Social link updated! ✨', 'success');
        }
    } catch (error) {
        console.error('Error saving social link:', error);
        showAlert('Error saving social link', 'error');
    }
};

window.deleteSocialLink = async function(platform) {
    if (!confirm(`Delete ${platform} link?`)) return;
    
    try {
        const response = await fetchWithAuth(`${API_URL}/profile`);
        const profile = await response.json();
        
        const socialLinks = profile.socialLinks || {};
        delete socialLinks[platform];
        
        const updateResponse = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socialLinks })
        });
        
        const data = await updateResponse.json();
        if (data.success) {
            showAlert('Social link deleted!', 'success');
            loadSocialLinks();
        }
    } catch (error) {
        console.error('Error deleting social link:', error);
        showAlert('Error deleting social link', 'error');
    }
};

// Add Social Modal
document.getElementById('addSocialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const platform = document.getElementById('socialPlatform').value;
    const customPlatform = document.getElementById('customPlatform')?.value;
    const icon = document.getElementById('socialIcon').value;
    const url = document.getElementById('socialUrl').value;
    
    const platformName = platform === 'custom' ? customPlatform : platform;
    
    try {
        const response = await fetchWithAuth(`${API_URL}/profile`);
        const profile = await response.json();
        
        const socialLinks = profile.socialLinks || {};
        socialLinks[platformName] = url;
        
        const updateResponse = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socialLinks })
        });
        
        const data = await updateResponse.json();
        if (data.success) {
            showAlert('Social platform added! ✨', 'success');
            closeModal('addSocialModal');
            e.target.reset();
            loadSocialLinks();
        }
    } catch (error) {
        console.error('Error adding social link:', error);
        showAlert('Error adding social link', 'error');
    }
});

// ============================================
// TESTIMONIALS MANAGEMENT
// ============================================

async function loadTestimonials() {
    const container = document.getElementById('testimonialsList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading testimonials...</div>';

    try {
        const response = await fetchWithAuth(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (!testimonials || testimonials.length === 0) {
            container.innerHTML = '<div class="text-center">No testimonials yet</div>';
            return;
        }

        container.innerHTML = testimonials.map(t => `
            <div class="testimonial-item" data-id="${t._id || t.id}">
                <div class="testimonial-quote">"${escapeHtml(t.content)}"</div>
                <div class="testimonial-author">
                    ${t.image ? `<img src="${BASE_URL}${t.image}" alt="${t.name}">` : ''}
                    <div>
                        <h4>${escapeHtml(t.name)}</h4>
                        <p>${escapeHtml(t.position || '')} ${t.company ? 'at ' + escapeHtml(t.company) : ''}</p>
                        <div class="testimonial-rating">
                            ${'⭐'.repeat(t.rating || 5)}
                        </div>
                    </div>
                </div>
                <div class="testimonial-actions">
                    <button class="action-btn edit-btn" onclick="editTestimonial('${t._id || t.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTestimonial('${t._id || t.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading testimonials:', error);
        container.innerHTML = '<div class="text-center error">Error loading testimonials</div>';
    }
}

window.showAddTestimonialModal = function() {
    document.getElementById('addTestimonialModal').classList.add('active');
};

document.getElementById('addTestimonialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('testimonialName').value);
    formData.append('position', document.getElementById('testimonialPosition').value);
    formData.append('company', document.getElementById('testimonialCompany').value);
    formData.append('content', document.getElementById('testimonialContent').value);
    formData.append('rating', document.getElementById('testimonialRating').value);
    
    const imageFile = document.getElementById('testimonialImage')?.files[0];
    if (imageFile) formData.append('image', imageFile);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/testimonials`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Testimonial added! ✨', 'success');
            closeModal('addTestimonialModal');
            e.target.reset();
            document.getElementById('testimonialImagePreview').style.display = 'none';
            loadTestimonials();
        }
    } catch (error) {
        console.error('Error adding testimonial:', error);
        showAlert('Error adding testimonial', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

window.deleteTestimonial = async function(id) {
    if (!confirm('Delete this testimonial?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/testimonials/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Testimonial deleted!', 'success');
            loadTestimonials();
        }
    } catch (error) {
        showAlert('Error deleting testimonial', 'error');
    }
};

// ============================================
// SETTINGS
// ============================================

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
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const settings = {
        siteTitle: document.getElementById('siteTitle')?.value || '',
        siteDescription: document.getElementById('siteDescription')?.value || '',
        adminEmail: document.getElementById('adminEmail')?.value || '',
        maintenanceMode: document.getElementById('maintenanceMode')?.checked || false,
        copyrightText: document.getElementById('copyrightText')?.value || 'All rights reserved',
        siteLanguage: document.getElementById('siteLanguage')?.value || 'en'
    };

    try {
        const response = await fetchWithAuth(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Settings updated! ✨', 'success');
        }
    } catch (error) {
        showAlert('Error updating settings', 'error');
    }
});

// ============================================
// UPLOADS MANAGER
// ============================================

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
            showAlert('File deleted!', 'success');
            loadUploads();
        }
    } catch (error) {
        showAlert('Error deleting file', 'error');
    }
};

// ============================================
// BACKUP & RESTORE
// ============================================

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
        showAlert('Backup created! 💾', 'success');
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
                showAlert('Data restored! ✨', 'success');
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            showAlert('Error restoring data: Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
};

// ============================================
// MESSAGES
// ============================================

async function loadMessages() {
    const tbody = document.getElementById('messagesList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading messages...</td></tr>';

    try {
        const response = await fetchWithAuth(`${API_URL}/messages`);
        const messages = await response.json();

        if (!messages || messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No messages yet</td></tr>';
            return;
        }

        tbody.innerHTML = messages.map(m => `
            <tr class="${m.read ? '' : 'unread'}">
                <td>${!m.read ? '<span class="badge" style="background: #ff6b9d">New</span>' : '<span class="badge" style="background: #888">Read</span>'}</td>
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

window.viewMessage = async function(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/${id}`);
        const message = await response.json();

        if (!message) {
            showAlert('Message not found', 'error');
            return;
        }

        const detailDiv = document.getElementById('messageDetail');
        detailDiv.innerHTML = `
            <div class="message-detail">
                <div class="detail-row"><strong>From:</strong> ${escapeHtml(message.name)} (${escapeHtml(message.email)})</div>
                <div class="detail-row"><strong>Subject:</strong> ${escapeHtml(message.subject || 'No Subject')}</div>
                <div class="detail-row"><strong>Date:</strong> ${formatDate(message.createdAt || message.date)}</div>
                <div class="detail-row"><strong>Message:</strong><div class="message-content">${escapeHtml(message.message).replace(/\n/g, '<br>')}</div></div>
            </div>
        `;

        document.getElementById('messageModal').classList.add('active');
        window.currentMessageId = id;
        window.currentMessageEmail = message.email;
        
        if (!message.read) {
            await fetchWithAuth(`${API_URL}/messages/${id}/read`, { method: 'PUT' });
            updateUnreadCount();
            loadMessages();
        }
    } catch (error) {
        console.error('Error loading message:', error);
        showAlert('Error loading message', 'error');
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
    showAlert('Messages refreshed! 🔄', 'info');
};

window.deleteMessage = async function(id) {
    if (!confirm('Delete this message?')) return;

    try {
        const response = await fetchWithAuth(`${API_URL}/messages/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showAlert('Message deleted!', 'success');
            loadMessages();
            updateUnreadCount();
            closeMessageModal();
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

// ============================================
// MESSAGE FILTERS
// ============================================
document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        const rows = document.querySelectorAll('#messagesList tr');
        
        rows.forEach(row => {
            if (filter === 'all') row.style.display = '';
            else if (filter === 'unread') row.style.display = row.classList.contains('unread') ? '' : 'none';
            else if (filter === 'read') row.style.display = !row.classList.contains('unread') ? '' : 'none';
        });
    });
});

// ============================================
// MODAL FUNCTIONS
// ============================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}
window.closeModal = closeModal;

// ============================================
// LOGOUT
// ============================================

function logout() {
    if (confirm('🌸 Logout? 🌸')) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html?loggedout=true';
    }
}
document.getElementById('logoutBtn')?.addEventListener('click', logout);

// ============================================
// SESSION MONITORING
// ============================================

setInterval(() => {
    const token = localStorage.getItem('adminToken');
    const loginTime = localStorage.getItem('adminLoginTime');
    if (token && loginTime && (Date.now() - parseInt(loginTime) > SESSION_TIMEOUT)) {
        console.log('Session expired - logging out');
        redirectToLogin('session_expired');
    }
}, 60000);

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Admin Dashboard Initialized');
    
    if (window.location.pathname.includes('dashboard.html')) {
        showSection('dashboard');
        await loadDashboard();
        await updateUnreadCount();
        await loadSocialLinks(); // Load social links
    }
    
    console.log('✅ Admin Panel Ready ✨');
});