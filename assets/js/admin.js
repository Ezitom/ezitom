/**
 * admin.js
 * Dashboard logic for EziTom Portfolio.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    renderAll();

    // Project Form Submit
    document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
    // Skill Form Submit
    document.getElementById('skillForm').addEventListener('submit', handleSkillSubmit);

    // Initial Badge Update
    updateMsgBadge();

    // Listen for new messages
    window.addEventListener('messagesUpdated', () => {
        updateMsgBadge();
        if (document.querySelector('.admin-nav-item[data-view="messages"]').classList.contains('active')) {
            renderMessages();
        }
    });

    // Add Buttons
    document.getElementById('btnAddProject').addEventListener('click', () => {
        openModal('projectModal', 'Add Project');
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
    });

    document.getElementById('btnAddSkill').addEventListener('click', () => {
        openModal('skillModal', 'Add Skill');
        document.getElementById('skillForm').reset();
        document.getElementById('skillId').value = '';
    });

    // Sidebar Toggle
    const sidebar = document.getElementById('adminSidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('open');
            toggle.innerHTML = isOpen 
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
        });

        // Close sidebar when clicking a nav item on mobile
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('open');
                    toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                }
            });
        });
    }

    // Option A: Fetch from Google Sheets
    fetchExternalMessages();
});

// ── EXTERNAL SYNC (Option A) ──────────────────────────────

async function fetchExternalMessages() {
    const scriptUrl = window.CONFIG?.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) return;

    try {
        const response = await fetch(scriptUrl);
        const externalMessages = await response.json();
        
        if (Array.isArray(externalMessages)) {
            const localMessages = DataManager.getMessages();
            
            // Merge: Add external messages if they don't exist locally (by email and timestamp)
            let updated = false;
            externalMessages.forEach(ext => {
                const exists = localMessages.some(loc => 
                    loc.email === ext.email && 
                    new Date(loc.timestamp).getTime() === new Date(ext.timestamp).getTime()
                );
                
                if (!exists) {
                    DataManager.saveMessage(ext);
                    updated = true;
                }
            });

            if (updated) {
                renderMessages();
                updateMsgBadge();
            }
        }
    } catch (e) {
        console.error('[dev.folio DEBUG] Error fetching external messages:', e);
    }
}

// ── NAVIGATION & UI ───────────────────────────────────────

function initTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item[data-view]');
    const views = document.querySelectorAll('.admin-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                if (view.id === `view-${viewId}`) view.classList.add('active');
            });
        });
    });
}

function openModal(id, title) {
    const modal = document.getElementById(id);
    const titleEl = id === 'projectModal' ? document.getElementById('modalTitle') : document.getElementById('skillModalTitle');
    if (titleEl) titleEl.textContent = title;
    modal.classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function showToast(msg) {
    const toast = document.getElementById('adminToast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── RENDERING ─────────────────────────────────────────────

function renderAll() {
    renderProjects();
    renderSkills();
    renderMessages();
}

function updateMsgBadge() {
    const badge = document.getElementById('msgBadge');
    const unreadCount = DataManager.getUnreadCount();
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function renderMessages() {
    const list = document.getElementById('messagesList');
    const messages = DataManager.getMessages();

    if (messages.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <p>No messages yet. When clients reach out, they'll appear here.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = messages.map(m => `
        <div class="message-card ${m.read ? 'read' : 'unread'}" onclick="openMessage(${m.id})">
            <div class="message-header">
                <div class="message-info">
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                        <h3 style="margin: 0;">${m.name}</h3>
                        ${m.emailStatus === 'sent' 
                            ? '<span class="status-badge status-sent"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Email Sent</span>' 
                            : m.emailStatus === 'failed'
                            ? '<span class="status-badge status-failed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Email Failed</span>'
                            : ''
                        }
                    </div>
                    <p>${m.email}</p>
                </div>
                <div class="message-time">${new Date(m.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text);">${m.subject}</div>
            <div class="message-preview">${m.message}</div>
        </div>
    `).join('');
}

function renderProjects() {
    const body = document.getElementById('projectsBody');
    const data = DataManager.getPortfolioData();

    body.innerHTML = data.projects.map(p => `
        <tr>
            <td data-label="Preview"><img src="${p.image_url}" class="admin-thumb" onerror="this.src='images/projects/default.svg'"></td>
            <td data-label="Project Details">
                <div style="font-weight:600;margin-bottom:0.25rem;">${p.title}</div>
                <div style="font-size:0.8rem;color:var(--text2);max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${p.description}
                </div>
            </td>
            <td data-label="Category"><span class="badge badge-${p.category.toLowerCase().split(' ')[0]}">${p.category}</span></td>
            <td data-label="Tech Stack"><div style="font-size:0.8rem;color:var(--text2);">${(p.tech_stack || []).join(', ')}</div></td>
            <td data-label="Actions">
                <div style="display:flex;gap:0.5rem;">
                    <button class="admin-btn btn-edit" onclick="editProject(${p.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                        Edit
                    </button>
                    <button class="admin-btn btn-delete" onclick="deleteProject(${p.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderSkills() {
    const body = document.getElementById('skillsBody');
    const data = DataManager.getPortfolioData();
    let html = '';

    for (const [cat, skills] of Object.entries(data.skills)) {
        skills.forEach(s => {
            html += `
                <tr>
                    <td data-label="Skill Name" style="font-weight:600;">${s.skill_name}</td>
                    <td data-label="Category"><span class="badge badge-business">${cat}</span></td>
                    <td data-label="Proficiency">
                        <div style="display:flex;align-items:center;gap:0.75rem;">
                            <div style="flex:1;background:rgba(255,255,255,0.05);height:6px;border-radius:10px;min-width:100px;">
                                <div style="width:${s.proficiency}%;background:var(--accent);height:100%;border-radius:10px;"></div>
                            </div>
                            <span style="font-size:0.8rem;color:var(--text2);">${s.proficiency}%</span>
                        </div>
                    </td>
                    <td data-label="Actions">
                        <div style="display:flex;gap:0.5rem;">
                            <button class="admin-btn btn-edit" onclick="editSkill('${cat}', ${s.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>
                                Edit
                            </button>
                            <button class="admin-btn btn-delete" onclick="deleteSkill('${cat}', ${s.id})">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    body.innerHTML = html;
}

// ── CRUD HANDLERS ─────────────────────────────────────────

function handleProjectSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('projectId').value;
    const project = {
        id: id ? parseInt(id) : null,
        title: document.getElementById('pTitle').value,
        description: document.getElementById('pDesc').value,
        category: document.getElementById('pCat').value,
        live_url: document.getElementById('pLive').value,
        image_url: document.getElementById('pImg').value,
        tech_stack: document.getElementById('pTech').value.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (id) {
        DataManager.updateProject(project);
        showToast('Project updated successfully!');
    } else {
        DataManager.addProject(project);
        showToast('Project added successfully!');
    }

    closeModal('projectModal');
    renderProjects();
}

window.editProject = function (id) {
    const data = DataManager.getPortfolioData();
    const p = data.projects.find(proj => proj.id === id);
    if (!p) return;

    document.getElementById('projectId').value = p.id;
    document.getElementById('pTitle').value = p.title;
    document.getElementById('pDesc').value = p.description;
    document.getElementById('pCat').value = p.category;
    document.getElementById('pLive').value = p.live_url;
    document.getElementById('pImg').value = p.image_url;
    document.getElementById('pTech').value = (p.tech_stack || []).join(', ');

    openModal('projectModal', 'Edit Project');
};

window.deleteProject = function (id) {
    if (confirm('Are you sure you want to delete this project?')) {
        DataManager.deleteProject(id);
        renderProjects();
        showToast('Project deleted.');
    }
};

function handleSkillSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('skillId').value;
    const oldCat = document.getElementById('oldCat').value;
    const cat = document.getElementById('sCat').value.trim();
    const skill = {
        id: id ? parseInt(id) : null,
        skill_name: document.getElementById('sName').value,
        proficiency: parseInt(document.getElementById('sProf').value)
    };

    if (id) {
        // If category changed, delete from old and add to new
        if (oldCat !== cat) {
            DataManager.deleteSkill(oldCat, parseInt(id));
            DataManager.addSkill(cat, skill);
        } else {
            DataManager.updateSkill(cat, skill);
        }
        showToast('Skill updated!');
    } else {
        DataManager.addSkill(cat, skill);
        showToast('Skill added!');
    }

    closeModal('skillModal');
    renderSkills();
}

window.editSkill = function (cat, id) {
    const data = DataManager.getPortfolioData();
    const s = data.skills[cat].find(skill => skill.id === id);
    if (!s) return;

    document.getElementById('skillId').value = s.id;
    document.getElementById('oldCat').value = cat;
    document.getElementById('sName').value = s.skill_name;
    document.getElementById('sCat').value = cat;
    document.getElementById('sProf').value = s.proficiency;

    openModal('skillModal', 'Edit Skill');
};

window.deleteSkill = function (cat, id) {
    if (confirm('Are you sure you want to delete this skill?')) {
        DataManager.deleteSkill(cat, id);
        renderSkills();
        showToast('Skill deleted.');
    }
};

window.openMessage = function(id) {
    const messages = DataManager.getMessages();
    const m = messages.find(msg => msg.id === id);
    if (!m) return;

    // Mark as read
    DataManager.markMessageAsRead(id);
    renderMessages();
    updateMsgBadge();

    // Fill Modal
    document.getElementById('msgDetailName').textContent = m.name;
    document.getElementById('msgDetailEmail').textContent = m.email;
    document.getElementById('msgDetailTime').textContent = new Date(m.timestamp).toLocaleString();
    document.getElementById('msgDetailSubject').textContent = m.subject;
    document.getElementById('msgDetailBody').textContent = m.message;

    // Handle Delete from Modal
    const deleteBtn = document.getElementById('btnDeleteMsg');
    deleteBtn.onclick = () => {
        if (confirm('Delete this message permanently?')) {
            DataManager.deleteMessage(id);
            closeModal('messageDetailModal');
            renderMessages();
            updateMsgBadge();
            showToast('Message deleted.');
        }
    };

    openModal('messageDetailModal', 'Message Detail');
};
