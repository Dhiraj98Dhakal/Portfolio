// ============================================
// admin.js - Complete Admin Panel Logic
// ============================================

// ========== CONFIGURATION ==========
// Railway Backend URL
const API_URL = 'https://diplomatic-light-production.up.railway.app/api';
const BASE_URL = 'https://diplomatic-light-production.up.railway.app';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

console.log('✅ Admin JS Loaded');
console.log('📍 API URL:', API_URL);

// ========== AUTH CHECK ==========
const token = localStorage.getItem('adminToken');
const loginTime = localStorage.getItem('adminLoginTime');

if (!token || !loginTime) {
    console.log('❌ No token found');
    window.location.href = 'index.html';
}

const loginTimestamp = parseInt(loginTime);
if (isNaN(loginTimestamp) || (Date.now() - loginTimestamp > SESSION_TIMEOUT)) {
    console.log('❌ Session expired');
    localStorage.clear();
    window.location.href = 'index.html';
}

// ========== FETCH WITH AUTH ==========
async function fetchWithAuth(url, options = {}) {
    try {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        
        const response = await fetch(url, options);
        
        if (response.status === 401) {
            console.log('❌ Unauthorized - redirecting to login');
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Unauthorized');
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// ========== UTILITY FUNCTIONS ==========
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#00ff9d' : '#ff0055'};
        color: ${type === 'success' ? '#0a0a0f' : 'white'};
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
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

// ========== SESSION TIMER ==========
function updateSessionTimer() {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (!loginTime) return;
    
    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_TIMEOUT - elapsed;
    
    if (remaining <= 0) {
        localStorage.clear();
        window.location.href = 'index.html?error=expired';
        return;
    }
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    document.getElementById('timerDisplay').textContent = `${hours}h ${minutes}m remaining`;
}

setInterval(updateSessionTimer, 60000);
updateSessionTimer();

// ========== SECTION NAVIGATION ==========
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const pageTitle = document.getElementById('pageTitle');
const pageDescription = document.getElementById('pageDescription');

window.showSection = function(sectionId) {
    // Hide all sections
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId + '-section');
    if (selectedSection) selectedSection.classList.add('active');
    
    // Update nav links
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    // Update page title
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
        'testimonials': { title: 'Testimonials', desc: 'Manage client testimonials' }
    };
    
    if (pageTitle) pageTitle.textContent = titles[sectionId]?.title || 'Dashboard';
    if (pageDescription) pageDescription.textContent = titles[sectionId]?.desc || '';
    
    // Load section data
    switch(sectionId) {
        case 'dashboard': loadDashboard(); break;
        case 'profile': loadProfile(); break;
        case 'projects': loadProjects(); break;
        case 'skills': loadSkills(); break;
        case 'social': loadSocial(); break;
        case 'settings': loadSettings(); break;
        case 'uploads': loadUploads(); break;
        case 'messages': loadMessages(); break;
        case 'testimonials': loadTestimonials(); break;
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
        const [projects, skills, messages] = await Promise.all([
            fetch(`${API_URL}/projects`).then(r => r.json()).catch(() => []),
            fetch(`${API_URL}/skills`).then(r => r.json()).catch(() => []),
            fetchWithAuth(`${API_URL}/messages`).then(r => r.json()).catch(() => [])
        ]);
        
        const featuredCount = projects.filter(p => p.featured).length;
        
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
                <div class="stat-icon"><i class="fas fa-envelope"></i></div>
                <div class="stat-value">${messages.length}</div>
                <div class="stat-label">Messages</div>
            </div>
        `;
        
    } catch (error) {
        console.error('Dashboard error:', error);
        statsContainer.innerHTML = '<div class="error">Error loading dashboard</div>';
    }
}

// ========== PROFILE - UPDATED WITH ABOUT TEXT, EDUCATION & STATS ==========
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();

        // Basic info
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileTitle').value = profile.title || '';
        document.getElementById('profileBio').value = profile.bio || '';
        
        // About Text (NEW)
        const aboutTextElement = document.getElementById('profileAboutText');
        if (aboutTextElement) {
            aboutTextElement.value = profile.aboutText || 'BICTE student passionate about web development.';
        }
        
        // Contact info
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileLocation').value = profile.location || '';
        document.getElementById('profileCountry').value = profile.country || 'Nepal';
        
        // Experience & Initials
        document.getElementById('profileExperience').value = profile.experience || '2+';
        document.getElementById('profileInitials').value = profile.initials || 'D';
        
        // Education (NEW)
        const educationElement = document.getElementById('profileEducation');
        if (educationElement) {
            educationElement.value = profile.education || 'BICTE (2022 - Present)';
        }

        // Stats (for about section)
        if (profile.stats) {
            // These are handled by data-stat attributes in frontend
            console.log('Stats loaded:', profile.stats);
        }

        // Profile image preview
        if (profile.profileImage) {
            const preview = document.getElementById('profileImagePreview');
            preview.src = profile.profileImage.startsWith('http') ? profile.profileImage : `${BASE_URL}${profile.profileImage}`;
            preview.style.display = 'block';
        }
        
        // About image preview
        if (profile.aboutImage) {
            const preview = document.getElementById('aboutImagePreview');
            preview.src = profile.aboutImage.startsWith('http') ? profile.aboutImage : `${BASE_URL}${profile.aboutImage}`;
            preview.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Error loading profile', 'error');
    }
}

// Image previews
document.getElementById('profileImage')?.addEventListener('change', function(e) {
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

document.getElementById('aboutImage')?.addEventListener('change', function(e) {
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

// ========== PROFILE FORM SUBMIT - UPDATED ==========
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Basic fields
    const fields = ['name', 'title', 'bio', 'email', 'phone', 'location', 'country', 'experience', 'initials', 'education'];
    fields.forEach(field => {
        const elementId = field === 'education' ? 'profileEducation' : `profile${field.charAt(0).toUpperCase() + field.slice(1)}`;
        const value = document.getElementById(elementId)?.value;
        if (value) formData.append(field, value);
    });
    
    // About Text (NEW)
    const aboutText = document.getElementById('profileAboutText')?.value;
    if (aboutText) formData.append('aboutText', aboutText);

    // Stats (for about section)
    const stats = {
        projects: document.querySelector('[data-stat="projects"]')?.textContent || '15+',
        certificates: document.querySelector('[data-stat="certificates"]')?.textContent || '8',
        clients: document.querySelector('[data-stat="clients"]')?.textContent || '10+',
        years: document.querySelector('[data-stat="years"]')?.textContent || '2'
    };
    formData.append('stats', JSON.stringify(stats));

    // Images
    const profileImg = document.getElementById('profileImage')?.files[0];
    if (profileImg) formData.append('profileImage', profileImg);
    
    const aboutImg = document.getElementById('aboutImage')?.files[0];
    if (aboutImg) formData.append('aboutImage', aboutImg);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Profile updated successfully!');
            localStorage.setItem('adminUpdate', Date.now());
        } else {
            showAlert('Error: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        showAlert('Error updating profile', 'error');
        console.error(error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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
                    <img src="${p.image ? (p.image.startsWith('http') ? p.image : BASE_URL + p.image) : 'https://via.placeholder.com/50'}" 
                         style="width:50px;height:50px;object-fit:cover;border-radius:5px;"
                         onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td>${escapeHtml(p.title)}</td>
                <td>${escapeHtml(p.description.substring(0, 50))}...</td>
                <td>${p.technologies?.slice(0,2).join(', ') || ''}</td>
                <td>
                    <span style="color:${p.featured ? '#00ff9d' : '#ff00c8'};font-weight:600">
                        ${p.featured ? 'Featured' : 'Regular'}
                    </span>
                </td>
                <td class="action-btns">
                    <button class="btn btn-warning btn-sm" onclick="editProject('${p._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProject('${p._id}')">Del</button>
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
        } else {
            showAlert('Error adding project', 'error');
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
        const project = projects.find(p => p._id == id);

        if (!project) {
            showAlert('Project not found', 'error');
            return;
        }

        setValue('editProjectId', project._id);
        setValue('editProjectTitle', project.title);
        setValue('editProjectDescription', project.description);
        setValue('editProjectTechnologies', project.technologies?.join(', ') || '');
        setValue('editProjectGithub', project.github || '');
        setValue('editProjectDemo', project.demo || '');
        
        const featuredCheck = document.getElementById('editProjectFeatured');
        if (featuredCheck) featuredCheck.checked = project.featured || false;

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
            closeEditProjectModal();
            loadProjects();
        } else {
            showAlert('Error updating project', 'error');
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
            showAlert('Project deleted successfully!');
            loadProjects();
        } else {
            showAlert('Error deleting project', 'error');
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
                <td><span>${s.category || 'General'}</span></td>
                <td class="action-btns">
                    <button class="btn btn-danger btn-sm" onclick="deleteSkill('${s._id}')">Del</button>
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
            closeSkillModal();
            e.target.reset();
            loadSkills();
        } else {
            showAlert('Error adding skill', 'error');
        }
    } catch (error) {
        showAlert('Error adding skill', 'error');
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
        } else {
            showAlert('Error deleting skill', 'error');
        }
    } catch (error) {
        showAlert('Error deleting skill', 'error');
    }
};

// ========== SOCIAL LINKS ==========
async function loadSocial() {
    try {
        const response = await fetch(`${API_URL}/profile`);
        const profile = await response.json();
        
        const links = profile.socialLinks || profile;
        
        console.log('📥 Loading social links:', links);

        document.getElementById('socialGithub').value = links.github || '';
        document.getElementById('socialLinkedin').value = links.linkedin || '';
        document.getElementById('socialTwitter').value = links.twitter || '';
        document.getElementById('socialInstagram').value = links.instagram || '';
        document.getElementById('socialFacebook').value = links.facebook || '';
        document.getElementById('socialYoutube').value = links.youtube || '';
        
    } catch (error) {
        console.error('Error loading social links:', error);
        showAlert('Error loading social links', 'error');
    }
}

document.getElementById('socialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const socialLinks = {
        github: document.getElementById('socialGithub')?.value || '',
        linkedin: document.getElementById('socialLinkedin')?.value || '',
        twitter: document.getElementById('socialTwitter')?.value || '',
        instagram: document.getElementById('socialInstagram')?.value || '',
        facebook: document.getElementById('socialFacebook')?.value || '',
        youtube: document.getElementById('socialYoutube')?.value || ''
    };

    console.log('📤 Sending social links:', socialLinks);

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ socialLinks })
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Social links updated successfully!');
            console.log('✅ Social links update successful:', data.profile?.socialLinks);
            
            if (data.profile && data.profile.socialLinks) {
                const updated = data.profile.socialLinks;
                document.getElementById('socialGithub').value = updated.github || '';
                document.getElementById('socialLinkedin').value = updated.linkedin || '';
                document.getElementById('socialTwitter').value = updated.twitter || '';
                document.getElementById('socialInstagram').value = updated.instagram || '';
                document.getElementById('socialFacebook').value = updated.facebook || '';
                document.getElementById('socialYoutube').value = updated.youtube || '';
                
                console.log('📥 Updated social links from response:', updated);
            } else {
                await loadSocial();
            }
            
            localStorage.setItem('adminUpdate', Date.now());
        } else {
            showAlert('Error: ' + (data.message || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('❌ Social links update error:', error);
        showAlert('Error updating social links', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// ========== SETTINGS ==========
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();

        document.getElementById('siteTitle').value = settings.siteTitle || '';
        document.getElementById('siteDescription').value = settings.siteDescription || '';
        document.getElementById('adminEmail').value = settings.adminEmail || '';
        
        const maintenanceCheck = document.getElementById('maintenanceMode');
        if (maintenanceCheck) maintenanceCheck.checked = settings.maintenanceMode || false;
        
        document.getElementById('copyrightText').value = settings.copyrightText || 'All rights reserved';
        document.getElementById('siteLanguage').value = settings.siteLanguage || 'en';
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showAlert('Error loading settings', 'error');
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

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetchWithAuth(`${API_URL}/settings`, {
            method: 'PUT',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Settings updated successfully!');
            loadSettings();
        } else {
            showAlert('Error updating settings', 'error');
        }
    } catch (error) {
        showAlert('Error updating settings', 'error');
        console.error(error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// ========== UPLOADS ==========
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
                <img src="${BASE_URL}/uploads/${file}" 
                     onerror="this.src='https://via.placeholder.com/150'">
                <p>${file}</p>
                <button class="btn btn-danger btn-sm" onclick="deleteUpload('${file}')">
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
        } else {
            showAlert('Error deleting file', 'error');
        }
    } catch (error) {
        showAlert('Error deleting file', 'error');
    }
};

// ========== MESSAGES ==========
async function loadMessages() {
    const tbody = document.getElementById('messagesList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading messages...</td></tr>';

    try {
        const response = await fetchWithAuth(`${API_URL}/messages`);
        const messages = await response.json();

        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No messages yet</td></tr>';
            return;
        }

        tbody.innerHTML = messages.map(m => `
            <tr class="${m.read ? '' : 'unread'}">
                <td>
                    ${m.read ? 'Read' : '<span style="color:#ff00c8;font-weight:600">New</span>'}
                </td>
                <td>${escapeHtml(m.name)}</td>
                <td><a href="mailto:${m.email}" style="color:#c0c0ff">${escapeHtml(m.email)}</a></td>
                <td>${formatDate(m.createdAt)}</td>
                <td class="action-btns">
                    <button class="btn btn-primary btn-sm" onclick="viewMessage('${m._id}')">View</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMessage('${m._id}')">Del</button>
                </td>
            </tr>
        `).join('');
        
        await updateUnreadCount();
        
    } catch (error) {
        console.error('Error loading messages:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center error">Error loading messages</td></tr>';
    }
}

window.viewMessage = async function(id) {
    try {
        const response = await fetchWithAuth(`${API_URL}/messages/${id}`);
        const message = await response.json();

        if (!message.read) {
            await fetchWithAuth(`${API_URL}/messages/${id}/read`, { method: 'PUT' });
        }

        document.getElementById('messageDetail').innerHTML = `
            <div class="message-detail">
                <div class="detail-row">
                    <strong>From:</strong> ${escapeHtml(message.name)} (${escapeHtml(message.email)})
                </div>
                <div class="detail-row">
                    <strong>Date:</strong> ${formatDate(message.createdAt)}
                </div>
                <div class="detail-row">
                    <strong>Message:</strong>
                    <div class="message-content">${escapeHtml(message.message).replace(/\n/g, '<br>')}</div>
                </div>
            </div>
        `;

        document.getElementById('messageModal').classList.add('active');
        window.currentMessageId = id;
        window.currentMessageEmail = message.email;
        
        loadMessages();
        updateUnreadCount();
        
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
            closeMessageModal();
        } else {
            showAlert('Error deleting message', 'error');
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

// ========== TESTIMONIALS ==========
async function loadTestimonials() {
    const tbody = document.getElementById('testimonialsList');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading testimonials...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const testimonials = await response.json();

        if (testimonials.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No testimonials</td></tr>';
            return;
        }

        tbody.innerHTML = testimonials.map(t => `
            <tr>
                <td>
                    <img src="${t.image ? (t.image.startsWith('http') ? t.image : BASE_URL + t.image) : 'https://via.placeholder.com/50'}" 
                         style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                </td>
                <td>${escapeHtml(t.name)}</td>
                <td>${escapeHtml(t.position || '-')}</td>
                <td>${escapeHtml(t.company || '-')}</td>
                <td>${'⭐'.repeat(t.rating)}</td>
                <td class="action-btns">
                    <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t._id}')">Del</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center error">Error loading testimonials</td></tr>';
    }
}

window.showAddTestimonialModal = function() {
    document.getElementById('testimonialModal').classList.add('active');
};

document.getElementById('testimonialForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('testimonialName')?.value);
    formData.append('position', document.getElementById('testimonialPosition')?.value || '');
    formData.append('company', document.getElementById('testimonialCompany')?.value || '');
    formData.append('content', document.getElementById('testimonialContent')?.value);
    formData.append('rating', document.getElementById('testimonialRating')?.value || 5);

    const imageFile = document.getElementById('testimonialImage')?.files[0];
    if (imageFile) formData.append('image', imageFile);

    try {
        const response = await fetchWithAuth(`${API_URL}/testimonials`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('Testimonial added successfully!');
            closeTestimonialModal();
            e.target.reset();
            loadTestimonials();
        } else {
            showAlert('Error adding testimonial', 'error');
        }
    } catch (error) {
        showAlert('Error adding testimonial', 'error');
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
            showAlert('Testimonial deleted successfully!');
            loadTestimonials();
        } else {
            showAlert('Error deleting testimonial', 'error');
        }
    } catch (error) {
        showAlert('Error deleting testimonial', 'error');
    }
};

// ========== MODAL FUNCTIONS ==========
window.closeSkillModal = function() {
    document.getElementById('skillModal').classList.remove('active');
};

window.closeTestimonialModal = function() {
    document.getElementById('testimonialModal').classList.remove('active');
};

window.closeEditProjectModal = function() {
    document.getElementById('editProjectModal').classList.remove('active');
};

// ========== LOGOUT ==========
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html?error=logout';
    }
});

// ========== SESSION MONITORING ==========
setInterval(() => {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (loginTime && (Date.now() - parseInt(loginTime) > SESSION_TIMEOUT)) {
        localStorage.clear();
        window.location.href = 'index.html?error=expired';
    }
}, 60000);

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Admin Dashboard Initialized');
    
    const adminUser = localStorage.getItem('adminUser') || 'Admin';
    const usernameEl = document.getElementById('adminUsername');
    if (usernameEl) usernameEl.textContent = adminUser;
    
    showSection('dashboard');
    
    await loadDashboard();
    await updateUnreadCount();
    
    console.log('✅ Admin Panel Ready');
});