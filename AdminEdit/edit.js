/**
 * ==============================================================================
 * WEBSITE EDITOR CMS APPLICATION LOGIC — Soarghaati Law College (/AdminEdit)
 * ==============================================================================
 */

import { SiteConfigService } from './services/siteConfigService.js';
import { EditAuthService } from './services/editAuthService.js';

// Application State
let currentConfig = SiteConfigService.getConfig();
let currentTab = 'courses';
let editingCourseId = null;
let editingFacultyId = null;
let tempFacultyPhoto = '';
let facultyCategoryFilter = 'all';

// DOM Root
const appRoot = document.getElementById('edit-app');

/**
 * Image processing & compression helper for Circular Faculty Photos
 * Automatically resizes & center-crops to 320x320 and compresses to JPEG ~25KB
 */
function processFacultyImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected'));
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      return reject(new Error('Please select a valid JPG, JPEG, or PNG image file.'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 320;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Center crop to 1:1 square
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        // Compress to JPEG with 0.82 quality
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        const kb = Math.round((compressed.length * 0.75) / 1024);
        resolve({ dataUrl: compressed, kb });
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Initials monogram generator for fallback avatar
 */
function getFacultyInitials(name = '') {
  const clean = name.replace(/^(Mr\.|Dr\.|Miss|Mrs\.|Smt\.|Prof\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'LC';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('edit-toasts');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `edit-toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Render App Route (Login Screen or Main CMS)
 */
function renderApp() {
  if (!EditAuthService.isAuthenticated()) {
    renderLogin();
  } else {
    renderDashboard();
  }
}

/**
 * Render Login Screen
 */
function renderLogin() {
  appRoot.innerHTML = `
    <div class="edit-login-wrap">
      <div class="edit-login-box">
        <div class="edit-login-brand">
          <img src="/college-logo.png" alt="Soarghaati Law College Logo" class="brand-logo-img" />
          <h2>Website Editor CMS</h2>
          <p>Soarghaati Law College • Pithoragarh, Uttarakhand</p>
          <div class="edit-login-pill">RESTRICTED ADMINISTRATIVE ACCESS</div>
        </div>

        <div id="login-error" class="edit-error-msg" style="display: none;"></div>

        <form id="edit-login-form">
          <div class="edit-input-group">
            <label for="admin-email">Administrator Email</label>
            <input type="email" id="admin-email" value="admin@soarghaati.edu.in" required placeholder="admin@soarghaati.edu.in" autocomplete="email" />
          </div>

          <div class="edit-input-group">
            <label for="admin-password">Administrative Password</label>
            <input type="password" id="admin-password" required placeholder="Enter CMS security password" autocomplete="current-password" />
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; font-size:0.82rem;">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="remember-me" checked />
              <span>Remember login</span>
            </label>
            <a href="javascript:void(0)" id="btn-show-pass" style="color:var(--slc-gold-600); text-decoration:none; font-weight:600;">Show Password</a>
          </div>

          <button type="submit" id="btn-login-submit" class="edit-login-btn">
            Unlock Website Editor →
          </button>
        </form>
      </div>
    </div>
  `;

  // Handlers
  const form = document.getElementById('edit-login-form');
  const errorDiv = document.getElementById('login-error');
  const passInput = document.getElementById('admin-password');
  const showPassBtn = document.getElementById('btn-show-pass');
  const submitBtn = document.getElementById('btn-login-submit');

  showPassBtn.addEventListener('click', () => {
    if (passInput.type === 'password') {
      passInput.type = 'text';
      showPassBtn.innerText = 'Hide Password';
    } else {
      passInput.type = 'password';
      showPassBtn.innerText = 'Show Password';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    submitBtn.innerText = 'Verifying Security Token...';
    submitBtn.disabled = true;

    const email = document.getElementById('admin-email').value;
    const password = passInput.value;
    const rememberMe = document.getElementById('remember-me').checked;

    const result = await EditAuthService.login(email, password, rememberMe);
    if (result.success) {
      showToast('Welcome, Administrator. CMS unlocked successfully.', 'success');
      renderDashboard();
    } else {
      errorDiv.innerText = result.error || 'Authentication failed.';
      errorDiv.style.display = 'flex';
      submitBtn.innerText = 'Unlock Website Editor →';
      submitBtn.disabled = false;
    }
  });
}

/**
 * Helper to sync open DOM inputs into currentConfig memory
 */
function syncInputsToConfig() {
  if (!currentConfig) return;

  // Auto-heal empty program options from current active courses
  if (!Array.isArray(currentConfig.formConfig?.programOptions) || currentConfig.formConfig.programOptions.length === 0) {
    if (Array.isArray(currentConfig.courses) && currentConfig.courses.length > 0) {
      currentConfig.formConfig.programOptions = currentConfig.courses.map(c => ({
        id: c.id,
        value: c.code || c.title,
        label: `${c.code || c.title} (${c.degreeBadge || c.duration || 'Degree'})`
      }));
    }
  }

  const formHeading = document.getElementById('form-heading');
  if (formHeading) currentConfig.formConfig.heading = formHeading.value.trim();

  const formSub = document.getElementById('form-subheading');
  if (formSub) currentConfig.formConfig.subheading = formSub.value.trim();

  const formBtn = document.getElementById('form-submit-text');
  if (formBtn) currentConfig.formConfig.submitBtnText = formBtn.value.trim();

  const phoneP = document.getElementById('contact-phone-primary');
  if (phoneP) {
    currentConfig.institution.phonePrimary = phoneP.value.trim();
    currentConfig.institution.phoneDisplay = phoneP.value.trim();
  }

  const waN = document.getElementById('contact-wa-number');
  if (waN) currentConfig.institution.whatsappNumber = waN.value.replace(/[^0-9]/g, '');

  const email = document.getElementById('contact-email');
  if (email) currentConfig.institution.email = email.value.trim();

  const instName = document.getElementById('inst-name');
  if (instName) currentConfig.institution.name = instName.value.trim();

  const instTag = document.getElementById('inst-tagline');
  if (instTag) currentConfig.institution.tagline = instTag.value.trim();

  const instAddr = document.getElementById('inst-address');
  if (instAddr) currentConfig.institution.address = instAddr.value.trim();

  const topAnn = document.getElementById('top-announcement-text');
  if (topAnn) currentConfig.institution.topAnnouncement = topAnn.value.trim();

  const acadYear = document.getElementById('academic-year-text');
  if (acadYear) currentConfig.institution.academicYear = acadYear.value.trim();

  const bUrl = document.getElementById('brochure-url');
  if (bUrl) currentConfig.institution.brochureUrl = bUrl.value.trim();

  if (document.getElementById('field-name')) {
    if (!currentConfig.formConfig.fields) currentConfig.formConfig.fields = {};
    currentConfig.formConfig.fields.nameRequired = document.getElementById('field-name').checked;
    currentConfig.formConfig.fields.mobileRequired = document.getElementById('field-mobile').checked;
    currentConfig.formConfig.fields.programRequired = document.getElementById('field-program').checked;
    currentConfig.formConfig.fields.qualificationRequired = document.getElementById('field-qual').checked;
    currentConfig.formConfig.fields.stateRequired = document.getElementById('field-state').checked;
    currentConfig.formConfig.fields.cityRequired = document.getElementById('field-city').checked;
  }
}

/**
 * Render Main CMS Dashboard
 */
function renderDashboard(reloadFromStorage = false) {
  if (reloadFromStorage || !currentConfig) {
    currentConfig = SiteConfigService.getConfig();
  }

  appRoot.innerHTML = `
    <div class="edit-cms-container">
      <!-- Top Navigation Header -->
      <header class="edit-header">
        <div class="edit-header-inner">
          <a href="/AdminEdit/" class="edit-brand-title">
            <img src="/college-logo.png" alt="Soarghaati Law College Logo" class="edit-brand-logo" />
            <div class="edit-brand-text">
              <h1>Soarghaati Law College CMS</h1>
              <span>/AdminEdit • Real-Time Dynamic Publisher</span>
            </div>
          </a>

          <div class="edit-header-actions">
            <a href="/" target="_blank" rel="noopener" class="btn-header-action btn-preview-site" title="Open live college website in new tab">
              <span>👁️ View Live Website</span>
            </a>
            <a href="/AdminDashboard/" target="_blank" rel="noopener" class="btn-header-action btn-leads-portal" title="Open Admissions Lead Portal">
              <span>📊 Leads Portal</span>
            </a>
            <button id="btn-save-all" class="btn-header-action btn-save-publish">
              <span>💾 Save &amp; Publish Changes</span>
            </button>
            <button id="btn-logout" class="btn-header-action btn-logout" title="Exit Editor">
              <span>🚪 Logout</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Sub-Bar Navigation Tabs -->
      <div class="edit-tab-bar-wrap">
        <div class="edit-tab-bar">
          <button class="edit-tab-btn ${currentTab === 'courses' ? 'active' : ''}" data-tab="courses">
            <span>🎓</span> Courses &amp; Programmes (${currentConfig.courses.length})
          </button>
          <button class="edit-tab-btn ${currentTab === 'faculty' ? 'active' : ''}" data-tab="faculty">
            <span>👨‍🏫</span> Faculty &amp; Staff (${(currentConfig.faculty || []).length})
          </button>
          <button class="edit-tab-btn ${currentTab === 'form' ? 'active' : ''}" data-tab="form">
            <span>📋</span> Admission Form &amp; Dropdowns
          </button>
          <button class="edit-tab-btn ${currentTab === 'contact' ? 'active' : ''}" data-tab="contact">
            <span>📞</span> Helplines &amp; Contacts
          </button>
          <button class="edit-tab-btn ${currentTab === 'announcements' ? 'active' : ''}" data-tab="announcements">
            <span>📢</span> Announcements &amp; Brochure
          </button>
          <button class="edit-tab-btn ${currentTab === 'settings' ? 'active' : ''}" data-tab="settings">
            <span>⚙️</span> CMS Settings &amp; Password
          </button>
          <button class="edit-tab-btn ${currentTab === 'history' ? 'active' : ''}" data-tab="history">
            <span>📜</span> Audit History
          </button>
        </div>
      </div>

      <!-- Main Panels Container -->
      <main class="edit-main">
        ${renderCoursesPanel()}
        ${renderFacultyPanel()}
        ${renderFormPanel()}
        ${renderContactPanel()}
        ${renderAnnouncementsPanel()}
        ${renderSettingsPanel()}
        ${renderHistoryPanel()}
      </main>

      <!-- Course Edit/Add Modal Container -->
      <div id="course-modal-overlay" class="cms-modal-overlay"></div>

      <!-- Faculty Edit/Add Modal Container -->
      <div id="faculty-modal-overlay" class="cms-modal-overlay"></div>
    </div>
  `;

  attachDashboardEvents();
}

/**
 * TAB 1: Courses & Programmes Panel
 */
function renderCoursesPanel() {
  return `
    <section class="edit-panel ${currentTab === 'courses' ? 'active' : ''}" id="panel-courses">
      <div class="panel-title-wrap">
        <div>
          <h2>Degree Programmes &amp; Academic Courses</h2>
          <p>Add new law programmes, edit seat matrix, curriculum modules, eligibility, or remove discontinued courses. Changes immediately reflect on the website and admission dropdowns.</p>
        </div>
        <button id="btn-add-course" class="btn-header-action btn-save-publish">
          <span>+ Add New Course</span>
        </button>
      </div>

      <div class="courses-cms-grid">
        ${currentConfig.courses.map((course, idx) => `
          <div class="course-cms-card ${course.isFeatured ? 'featured' : ''}" data-course-id="${course.id}">
            <div class="course-cms-badge-row">
              <span class="cms-badge ${course.badgeColor || 'gold'}">${course.degreeBadge}</span>
              ${course.isFeatured ? `<span class="cms-badge gold">⭐ ${course.featuredLabel || 'FEATURED'}</span>` : ''}
            </div>

            <h3 class="course-cms-title">${course.icon || '⚖️'} ${course.title}</h3>
            <div class="course-cms-subtitle">${course.subtitle || ''}</div>
            <p class="course-cms-desc">${course.description}</p>

            <div class="course-cms-meta">
              <div><span>Duration:</span> <strong>${course.duration}</strong></div>
              <div><span>Annual Capacity:</span> <strong>${course.annualSeats || 'N/A'}</strong></div>
              <div><span>Affiliation:</span> <strong>${course.affiliation}</strong></div>
              <div><span>Statutory Approval:</span> <strong>${course.approval}</strong></div>
              <div><span>Eligibility:</span> <strong>${course.eligibilityCode || 'N/A'}</strong></div>
            </div>

            <div class="course-cms-tags">
              ${(course.curriculumTags || []).map(t => `<span>${t}</span>`).join('')}
            </div>

            <div class="course-cms-actions">
              <button class="btn-card-action btn-edit-course" data-id="${course.id}">
                ✏️ Edit Details
              </button>
              <button class="btn-card-action btn-card-delete btn-delete-course" data-id="${course.id}" data-title="${course.title}">
                🗑️ Delete Course
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

/**
 * TAB: Academic Faculty & Institutional Staff Panel
 */
function renderFacultyPanel() {
  const faculty = currentConfig.faculty || [];
  const filtered = faculty.filter(f => {
    if (facultyCategoryFilter === 'all') return true;
    return f.category === facultyCategoryFilter;
  });

  return `
    <section class="edit-panel ${currentTab === 'faculty' ? 'active' : ''}" id="panel-faculty">
      <div class="panel-title-wrap">
        <div>
          <h2>Academic Faculty &amp; Institutional Staff (${faculty.length})</h2>
          <p>Add, edit, or remove faculty members, update academic qualifications, teaching subjects, and upload circular portrait photos. Images are automatically center-cropped and compressed to &lt;30 KB for ultra-fast loading without any lag.</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <a href="/faculty/" target="_blank" rel="noopener" class="btn-header-action btn-preview-site">
            <span>👁️ View Live Faculty Page</span>
          </a>
          <button id="btn-add-faculty" class="btn-header-action btn-save-publish">
            <span>+ Add Faculty Member</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Pills inside CMS -->
      <div style="display:flex; gap:8px; margin-bottom:18px; flex-wrap:wrap;">
        <button class="filter-pill ${facultyCategoryFilter === 'all' ? 'active' : ''} btn-filter-cms-fac" data-cat="all">
          All Staff (${faculty.length})
        </button>
        <button class="filter-pill ${facultyCategoryFilter === 'law' ? 'active' : ''} btn-filter-cms-fac" data-cat="law">
          ⚖️ Law Faculty (${faculty.filter(f => f.category === 'law').length})
        </button>
        <button class="filter-pill ${facultyCategoryFilter === 'humanities' ? 'active' : ''} btn-filter-cms-fac" data-cat="humanities">
          📖 Humanities (${faculty.filter(f => f.category === 'humanities').length})
        </button>
        <button class="filter-pill ${facultyCategoryFilter === 'library' ? 'active' : ''} btn-filter-cms-fac" data-cat="library">
          📚 Library (${faculty.filter(f => f.category === 'library').length})
        </button>
        <button class="filter-pill ${facultyCategoryFilter === 'admin' ? 'active' : ''} btn-filter-cms-fac" data-cat="admin">
          🏢 Office &amp; Admin (${faculty.filter(f => f.category === 'admin').length})
        </button>
        <button class="filter-pill ${facultyCategoryFilter === 'support' ? 'active' : ''} btn-filter-cms-fac" data-cat="support">
          🤝 Campus Support (${faculty.filter(f => f.category === 'support').length})
        </button>
      </div>

      <div class="faculty-cms-grid">
        ${filtered.map(member => {
          const isPrincipal = (member.designation || '').toLowerCase().includes('principal');
          const initials = getFacultyInitials(member.name);
          return `
            <div class="faculty-cms-card ${isPrincipal ? 'principal-cms' : ''}" data-fac-id="${member.id}">
              <div class="fac-cms-avatar-wrap">
                <div class="fac-cms-avatar">
                  ${member.photo ? `
                    <img src="${member.photo}" alt="${member.name}" />
                  ` : `
                    <div class="fac-cms-initials">${initials}</div>
                  `}
                </div>
              </div>

              <div class="fac-cms-name">${member.name}</div>
              <div class="fac-cms-desig">${member.designation}</div>

              <div class="fac-cms-info">
                <div><span>Department:</span> <strong>${member.department || 'Law Faculty'}</strong></div>
                <div><span>Qualifications:</span> <strong>${member.qualification || 'N/A'}</strong></div>
                <div><span>Subject / Role:</span> <strong>${member.subject || 'Law Studies'}</strong></div>
                <div><span>Photo Status:</span> <strong>${member.photo ? '✓ Circular Photo Uploaded' : 'ℹ️ Default Monogram'}</strong></div>
              </div>

              <div class="fac-cms-actions">
                <button class="btn-card-action btn-edit-fac" data-id="${member.id}">
                  ✏️ Edit Profile
                </button>
                <button class="btn-card-action btn-card-delete btn-delete-fac" data-id="${member.id}" data-name="${member.name}">
                  🗑️ Delete
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

/**
 * Open Faculty Add / Edit Modal with Circular Photo Upload
 */
function openFacultyModal(facultyMember = null) {
  const overlay = document.getElementById('faculty-modal-overlay');
  if (!overlay) return;

  const isEditing = !!facultyMember;
  editingFacultyId = facultyMember ? facultyMember.id : null;
  tempFacultyPhoto = facultyMember ? (facultyMember.photo || '') : '';

  const fac = facultyMember || {
    name: '',
    designation: 'Assistant Professor',
    department: 'Law Faculty',
    qualification: 'LL.M, NET',
    subject: '',
    category: 'law',
    photo: ''
  };

  overlay.innerHTML = `
    <div class="cms-modal-box">
      <div class="cms-modal-header">
        <h3>${isEditing ? '✏️ Edit Faculty &amp; Staff Profile' : '+ Add New Faculty Member'}</h3>
        <button type="button" class="cms-modal-close" id="btn-close-fac-modal">&times;</button>
      </div>

      <form id="faculty-editor-form">
        
        <!-- Circular Photo Upload Widget -->
        <div class="photo-uploader-box">
          <div class="photo-preview-circ" id="fac-photo-preview-circle">
            ${tempFacultyPhoto ? `
              <img src="${tempFacultyPhoto}" id="fac-preview-img" alt="Preview" />
            ` : `
              <div class="photo-preview-placeholder" id="fac-preview-placeholder">📷</div>
            `}
          </div>

          <div class="photo-upload-controls">
            <div style="font-weight:700; font-size:0.86rem; color:var(--slc-navy-950);">
              Faculty Circular Portrait Photo
            </div>
            <div class="photo-upload-hint">
              Upload JPG or JPEG format. Images are automatically cropped into a circular avatar and compressed to &lt;30 KB so the website never becomes laggy.
            </div>

            <div class="photo-upload-btns">
              <input type="file" id="fac-file-input" accept="image/jpeg,image/jpg,image/png" style="display:none;" />
              <button type="button" class="btn-upload-pic" id="btn-trigger-fac-upload">
                <span>📁 Upload Photo (JPG/JPEG)</span>
              </button>
              <button type="button" class="btn-remove-pic" id="btn-remove-fac-photo" style="${tempFacultyPhoto ? '' : 'display:none;'}">
                <span>✕ Remove Photo</span>
              </button>
            </div>

            <div id="fac-photo-status" class="photo-size-badge" style="${tempFacultyPhoto ? '' : 'display:none;'}">
              ✓ Ready for publication
            </div>
          </div>
        </div>

        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="f-name">Full Name &amp; Honorific *</label>
            <input type="text" id="f-name" required value="${fac.name}" placeholder="e.g. Mr. Mukul Chitransh or Dr. Devender Singh" />
          </div>
          <div class="edit-input-group">
            <label for="f-desig">Designation *</label>
            <input type="text" id="f-desig" required value="${fac.designation}" placeholder="e.g. Assistant Professor, Principal, Librarian" />
          </div>
        </div>

        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="f-cat">Category / Division *</label>
            <select id="f-cat" required>
              <option value="law" ${fac.category === 'law' ? 'selected' : ''}>⚖️ Law Faculty</option>
              <option value="humanities" ${fac.category === 'humanities' ? 'selected' : ''}>📖 Humanities &amp; Social Sciences</option>
              <option value="library" ${fac.category === 'library' ? 'selected' : ''}>📚 Library &amp; Documentation</option>
              <option value="admin" ${fac.category === 'admin' ? 'selected' : ''}>🏢 Administrative &amp; Office Staff</option>
              <option value="support" ${fac.category === 'support' ? 'selected' : ''}>🤝 Campus Support Staff</option>
            </select>
          </div>
          <div class="edit-input-group">
            <label for="f-dept">Department / Center</label>
            <input type="text" id="f-dept" value="${fac.department || ''}" placeholder="e.g. Law Faculty, Department of Humanities" />
          </div>
        </div>

        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="f-qual">Academic Qualifications *</label>
            <input type="text" id="f-qual" required value="${fac.qualification || ''}" placeholder="e.g. LL.M, NET, Ph.D in Law or M.A., Ph.D" />
          </div>
          <div class="edit-input-group">
            <label for="f-subject">Teaching Subject / Specialized Area *</label>
            <input type="text" id="f-subject" required value="${fac.subject || ''}" placeholder="e.g. Constitutional Law, Contract, History" />
          </div>
        </div>

        <div class="cms-modal-footer">
          <button type="button" class="btn-secondary" id="btn-cancel-fac">Cancel</button>
          <button type="submit" class="btn-primary">
            ${isEditing ? 'Save Faculty Profile' : '+ Add Faculty Member'}
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.classList.add('open');

  const closeFacModal = () => {
    overlay.classList.remove('open');
    editingFacultyId = null;
    tempFacultyPhoto = '';
  };

  document.getElementById('btn-close-fac-modal').addEventListener('click', closeFacModal);
  document.getElementById('btn-cancel-fac').addEventListener('click', closeFacModal);

  // Photo Upload Handlers
  const fileInput = document.getElementById('fac-file-input');
  const triggerBtn = document.getElementById('btn-trigger-fac-upload');
  const removePicBtn = document.getElementById('btn-remove-fac-photo');
  const previewBox = document.getElementById('fac-photo-preview-circle');
  const statusBadge = document.getElementById('fac-photo-status');

  triggerBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    triggerBtn.innerText = 'Compressing...';
    try {
      const res = await processFacultyImage(file);
      tempFacultyPhoto = res.dataUrl;

      // Update preview inside modal
      previewBox.innerHTML = `<img src="${tempFacultyPhoto}" id="fac-preview-img" alt="Preview" />`;
      removePicBtn.style.display = 'inline-flex';
      statusBadge.style.display = 'inline-flex';
      statusBadge.innerText = `✓ Compressed to ${res.kb} KB (Ready)`;
      showToast(`✓ Image optimized to ${res.kb} KB for instant loading!`, 'success');
    } catch (err) {
      alert(err.message || 'Error processing photo');
    } finally {
      triggerBtn.innerHTML = '<span>📁 Upload Photo (JPG/JPEG)</span>';
    }
  });

  removePicBtn.addEventListener('click', () => {
    tempFacultyPhoto = '';
    previewBox.innerHTML = `<div class="photo-preview-placeholder" id="fac-preview-placeholder">📷</div>`;
    removePicBtn.style.display = 'none';
    statusBadge.style.display = 'none';
    fileInput.value = '';
    showToast('Photo removed. Fallback monogram initials will be used.', 'success');
  });

  // Form submit
  document.getElementById('faculty-editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('f-name').value.trim();
    const designation = document.getElementById('f-desig').value.trim();
    const category = document.getElementById('f-cat').value;
    const department = document.getElementById('f-dept').value.trim() || 'Law Faculty';
    const qualification = document.getElementById('f-qual').value.trim();
    const subject = document.getElementById('f-subject').value.trim();

    const updatedFaculty = {
      id: editingFacultyId || ('fac-' + Date.now().toString(36)),
      name,
      designation,
      category,
      department,
      qualification,
      subject,
      photo: tempFacultyPhoto || ''
    };

    if (!Array.isArray(currentConfig.faculty)) {
      currentConfig.faculty = [];
    }

    if (editingFacultyId) {
      const idx = currentConfig.faculty.findIndex(f => f.id === editingFacultyId);
      if (idx !== -1) {
        currentConfig.faculty[idx] = updatedFaculty;
      }
    } else {
      currentConfig.faculty.push(updatedFaculty);
    }

    closeFacModal();
    syncInputsToConfig();
    showToast(`⏳ Saving faculty profile "${name}"...`, 'info');
    const saved = await SiteConfigService.saveConfig(currentConfig, (editingFacultyId ? 'Updated faculty: ' : 'Added new faculty: ') + name, 'Web Administrator');
    renderDashboard();
    if (saved) {
      showToast(`✓ Faculty profile "${name}" saved and published to live website!`, 'success');
    } else {
      showToast(`⚠️ Profile saved locally, server sync failed.`, 'warning');
    }
  });
}

/**
 * TAB 2: Admission Form & Dropdown Parameters Panel
 */
function renderFormPanel() {
  const { formConfig } = currentConfig;
  return `
    <section class="edit-panel ${currentTab === 'form' ? 'active' : ''}" id="panel-form">
      <div class="panel-title-wrap">
        <div>
          <h2>Admission Form &amp; Dropdown Configuration</h2>
          <p>Customize form headings, dropdown options for courses and states, and field mandatory requirements.</p>
        </div>
        <button type="button" id="btn-save-form" class="btn-header-action btn-save-publish">
          <span>💾 Save Form Settings</span>
        </button>
      </div>

      <div class="edit-grid-2">
        <!-- Form Headings -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>📝 Form Headings &amp; Buttons</h3>
          </div>
          <div class="edit-input-group">
            <label for="form-heading">Form Header Title</label>
            <input type="text" id="form-heading" value="${formConfig.heading || 'Admission and Brochure'}" />
          </div>
          <div class="edit-input-group">
            <label for="form-subheading">Form Subtitle / Explanation</label>
            <textarea id="form-subheading">${formConfig.subheading || ''}</textarea>
          </div>
          <div class="edit-input-group">
            <label for="form-submit-text">Submit Button Text</label>
            <input type="text" id="form-submit-text" value="${formConfig.submitBtnText || 'Proceed'}" />
          </div>
        </div>

        <!-- Field Constraints -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>🔒 Mandatory Fields (Required)</h3>
          </div>
          <p style="font-size:0.82rem; color:var(--slc-text-muted); margin-bottom:14px;">Toggle which fields the student must fill before proceeding:</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-name" ${formConfig.fields?.nameRequired ? 'checked' : ''} />
              <span>Candidate Full Name (Required)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-mobile" ${formConfig.fields?.mobileRequired ? 'checked' : ''} />
              <span>Contact Mobile Number (Required)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-program" ${formConfig.fields?.programRequired ? 'checked' : ''} />
              <span>Desired Programme Dropdown (Required)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-qual" ${formConfig.fields?.qualificationRequired ? 'checked' : ''} />
              <span>Highest Qualification / Marks (Required)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-state" ${formConfig.fields?.stateRequired ? 'checked' : ''} />
              <span>State Dropdown (Required)</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:0.88rem; cursor:pointer;">
              <input type="checkbox" id="field-city" ${formConfig.fields?.cityRequired ? 'checked' : ''} />
              <span>City / District Input (Required)</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Dropdown Items Lists -->
      <div class="edit-grid-2">
        <!-- Programme Dropdown Options -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>🎓 Course Dropdown Options (${formConfig.programOptions.length})</h3>
          </div>
          <p style="font-size:0.82rem; color:var(--slc-text-muted); margin-bottom:12px;">Options displayed in the student admission selection menu:</p>
          <div class="dynamic-items-list" id="program-options-list">
            ${formConfig.programOptions.map((opt, i) => `
              <div class="dynamic-item-row">
                <span>${opt.label || opt.value}</span>
                <button type="button" class="btn-remove-item btn-del-prog-opt" data-index="${i}">✕ Remove</button>
              </div>
            `).join('')}
          </div>
          <div class="add-item-row">
            <input type="text" id="new-prog-opt-val" placeholder="Value (e.g. LL.B 3-Year)" />
            <input type="text" id="new-prog-opt-lbl" placeholder="Display Label" />
            <button type="button" id="btn-add-prog-opt" class="btn-add-item">+ Add</button>
          </div>
        </div>

        <!-- State Dropdown Options -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>📍 State Dropdown Options (${formConfig.stateOptions.length})</h3>
          </div>
          <p style="font-size:0.82rem; color:var(--slc-text-muted); margin-bottom:12px;">States available in the admission form dropdown:</p>
          <div class="dynamic-items-list" id="state-options-list">
            ${formConfig.stateOptions.map((st, i) => `
              <div class="dynamic-item-row">
                <span>${st}</span>
                <button type="button" class="btn-remove-item btn-del-state-opt" data-index="${i}">✕ Remove</button>
              </div>
            `).join('')}
          </div>
          <div class="add-item-row">
            <input type="text" id="new-state-opt" placeholder="Enter State / Territory Name" />
            <button type="button" id="btn-add-state-opt" class="btn-add-item">+ Add State</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * TAB 3: Helplines & Contacts Panel
 */
function renderContactPanel() {
  const { institution } = currentConfig;
  return `
    <section class="edit-panel ${currentTab === 'contact' ? 'active' : ''}" id="panel-contact">
      <div class="panel-title-wrap">
        <div>
          <h2>Admissions Helplines &amp; Institutional Contacts</h2>
          <p>Update phone numbers, WhatsApp dispatch numbers, and campus address displayed across all banners, buttons, and footers.</p>
        </div>
        <button type="button" id="btn-save-contact" class="btn-header-action btn-save-publish">
          <span>💾 Save Helplines &amp; Contacts</span>
        </button>
      </div>

      <div class="edit-grid-2">
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>📞 Telephone &amp; WhatsApp</h3>
          </div>
          <div class="edit-input-group">
            <label for="contact-phone-primary">Primary Direct Admissions Helpline</label>
            <input type="text" id="contact-phone-primary" value="${institution.phonePrimary || '+91 7830201028'}" placeholder="+91 7830201028" />
          </div>
          <div class="edit-input-group">
            <label for="contact-wa-number">Admissions WhatsApp Number (Country code + 10 digits without +)</label>
            <input type="text" id="contact-wa-number" value="${institution.whatsappNumber || '917830201028'}" placeholder="917830201028" />
          </div>
          <div class="edit-input-group">
            <label for="contact-email">Official Admissions Email Address</label>
            <input type="email" id="contact-email" value="${institution.email || 'info@sglawcollege.com'}" placeholder="info@sglawcollege.com" />
          </div>
        </div>

        <div class="edit-card">
          <div class="edit-card-header">
            <h3>🏛️ Campus Identity &amp; Physical Address</h3>
          </div>
          <div class="edit-input-group">
            <label for="inst-name">Institution Official Name</label>
            <input type="text" id="inst-name" value="${institution.name || 'Soarghaati Law College'}" />
          </div>
          <div class="edit-input-group">
            <label for="inst-tagline">Official Tagline / Motto</label>
            <input type="text" id="inst-tagline" value="${institution.tagline || 'First Law College of Pithoragarh District, Uttarakhand'}" />
          </div>
          <div class="edit-input-group">
            <label for="inst-address">Campus Physical Address</label>
            <textarea id="inst-address">${institution.address || ''}</textarea>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * TAB 4: Announcements & Brochure Panel
 */
function renderAnnouncementsPanel() {
  const { institution } = currentConfig;
  return `
    <section class="edit-panel ${currentTab === 'announcements' ? 'active' : ''}" id="panel-announcements">
      <div class="panel-title-wrap">
        <div>
          <h2>Top Banner Announcement &amp; Brochure PDF</h2>
          <p>Control the announcement text displayed at the top of the website and the prospectus download destination.</p>
        </div>
        <button type="button" id="btn-save-announcements" class="btn-header-action btn-save-publish">
          <span>💾 Save Announcements &amp; Brochure</span>
        </button>
      </div>

      <div class="edit-grid-2">
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>📢 Announcement Banner Ticker</h3>
          </div>
          <div class="edit-input-group">
            <label for="top-announcement-text">Top Strip Announcement Message</label>
            <textarea id="top-announcement-text" style="min-height:95px;">${institution.topAnnouncement || ''}</textarea>
          </div>
          <div class="edit-input-group">
            <label for="academic-year-text">Current Academic Batch Year</label>
            <input type="text" id="academic-year-text" value="${institution.academicYear || '2026–27'}" placeholder="2026–27" />
          </div>
        </div>

        <div class="edit-card">
          <div class="edit-card-header">
            <h3>📄 College Prospectus / Brochure PDF URL</h3>
          </div>
          <p style="font-size:0.84rem; color:var(--slc-text-muted); margin-bottom:12px;">When candidates submit their details, this PDF will download automatically:</p>
          <div class="edit-input-group">
            <label for="brochure-url">Brochure File Path or External URL</label>
            <input type="text" id="brochure-url" value="${institution.brochureUrl || '/Soarghaati_Law_College_Brochure_2026.pdf'}" />
          </div>
          <div style="margin-top:14px; padding:12px; background:var(--slc-bg); border-radius:6px; font-size:0.8rem;">
            <span>Current File Target: </span>
            <a href="${institution.brochureUrl || '/Soarghaati_Law_College_Brochure_2026.pdf'}" target="_blank" rel="noopener" style="color:var(--slc-gold-600); font-weight:700;">
              Preview Brochure PDF ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * TAB 5: CMS Settings & Password Change Panel
 */
function renderSettingsPanel() {
  return `
    <section class="edit-panel ${currentTab === 'settings' ? 'active' : ''}" id="panel-settings">
      <div class="panel-title-wrap">
        <div>
          <h2>CMS Security Settings &amp; Configuration Backup</h2>
          <p>Change your CMS access password, export full site configuration as backup, or restore to factory defaults.</p>
        </div>
      </div>

      <div class="edit-grid-2">
        <!-- Change Password Card -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>🔐 Change Administrator Password</h3>
          </div>
          <form id="change-pass-form">
            <div class="edit-input-group">
              <label for="curr-pass">Current Password</label>
              <input type="password" id="curr-pass" required placeholder="Enter current password" />
            </div>
            <div class="edit-input-group">
              <label for="new-pass">New Administrative Password (min 6 chars)</label>
              <input type="password" id="new-pass" required placeholder="Enter new strong password" />
            </div>
            <div class="edit-input-group">
              <label for="confirm-pass">Confirm New Password</label>
              <input type="password" id="confirm-pass" required placeholder="Confirm new password" />
            </div>
            <button type="submit" class="btn-primary" style="width:100%; margin-top:8px;">
              Update Security Password
            </button>
          </form>
        </div>

        <!-- Backup & Reset Card -->
        <div class="edit-card">
          <div class="edit-card-header">
            <h3>💾 Configuration Backup &amp; Recovery</h3>
          </div>
          <p style="font-size:0.84rem; color:var(--slc-text-muted); margin-bottom:16px;">Export your complete course catalog and site settings as JSON for safekeeping:</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
            <button type="button" id="btn-export-json" class="btn-secondary">
              📥 Export Config JSON
            </button>
            <label class="btn-secondary" style="cursor:pointer; display:inline-flex; align-items:center;">
              <span>📤 Import Config JSON</span>
              <input type="file" id="file-import-json" accept=".json" style="display:none;" />
            </label>
          </div>

          <div style="border-top:1px solid var(--slc-border); padding-top:16px; margin-top:16px;">
            <h4 style="font-size:0.92rem; color:var(--slc-red-600); margin-bottom:6px;">⚠️ Reset to Factory Defaults</h4>
            <p style="font-size:0.8rem; color:var(--slc-text-muted); margin-bottom:12px;">Restore all original 2026 Soarghaati Law College courses and form parameters:</p>
            <button type="button" id="btn-reset-factory" class="btn-secondary" style="color:var(--slc-red-600); border-color:#fecaca;">
              Reset Everything to Defaults
            </button>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * TAB 6: Audit History Panel
 */
function renderHistoryPanel() {
  const history = SiteConfigService.getAuditHistory();
  return `
    <section class="edit-panel ${currentTab === 'history' ? 'active' : ''}" id="panel-history">
      <div class="panel-title-wrap">
        <div>
          <h2>Configuration Change Audit Trail</h2>
          <p>Chronological log of modifications, course additions, and publication events made via this dashboard.</p>
        </div>
      </div>

      <div class="edit-card">
        <div class="audit-table-wrap">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Author</th>
                <th>Modification Description</th>
              </tr>
            </thead>
            <tbody>
              ${history.length > 0 ? history.map(h => `
                <tr>
                  <td><code>${h.id}</code></td>
                  <td>${new Date(h.timestamp).toLocaleString()}</td>
                  <td><strong>${h.author}</strong></td>
                  <td>${h.action}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4" style="text-align:center; padding:24px; color:var(--slc-text-muted);">
                    No modifications recorded yet. All settings match initial setup.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render Course Add / Edit Modal
 */
function openCourseModal(courseToEdit = null) {
  editingCourseId = courseToEdit ? courseToEdit.id : null;
  const isEditing = !!courseToEdit;
  const course = courseToEdit || {
    id: 'course-' + Date.now().toString(36),
    code: 'B.A. LL.B',
    degreeBadge: '5 YEARS INTEGRATED',
    badgeColor: 'gold',
    eligibilityCode: 'ELIGIBILITY: 10+2 (ANY STREAM)',
    title: '',
    subtitle: '',
    description: '',
    duration: '5 Academic Years (10 Semesters)',
    affiliation: 'SSJ University, Almora',
    approval: 'Bar Council of India (BCI)',
    annualSeats: '60 Seats',
    isFeatured: false,
    featuredLabel: 'MOST POPULAR',
    icon: '⚖️',
    heroDesc: 'Integrated Course',
    curriculumTags: ['Constitutional Law', 'Criminal Law', 'Law of Contracts']
  };

  const overlay = document.getElementById('course-modal-overlay');
  overlay.innerHTML = `
    <div class="cms-modal-box">
      <div class="cms-modal-header">
        <h3>${isEditing ? '✏️ Edit Course Details' : '+ Add New Degree Programme'}</h3>
        <button type="button" class="cms-modal-close" id="btn-close-course-modal">&times;</button>
      </div>

      <form id="course-editor-form">
        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="c-title">Course Title (Full Name) *</label>
            <input type="text" id="c-title" required value="${course.title}" placeholder="e.g. B.A. LL.B (Honours) or Cyber Law Diploma" />
          </div>
          <div class="edit-input-group">
            <label for="c-code">Short Code / Badge Name *</label>
            <input type="text" id="c-code" required value="${course.code}" placeholder="e.g. B.A. LL.B or LL.B" />
          </div>
        </div>

        <div class="edit-input-group">
          <label for="c-subtitle">Subtitle / Degree Type</label>
          <input type="text" id="c-subtitle" value="${course.subtitle}" placeholder="e.g. Bachelor of Arts & Bachelor of Laws • Integrated Undergraduate Degree" />
        </div>

        <div class="edit-input-group">
          <label for="c-desc">Course Detailed Description *</label>
          <textarea id="c-desc" required style="min-height:75px;">${course.description}</textarea>
        </div>

        <div class="edit-grid-3">
          <div class="edit-input-group">
            <label for="c-badge">Duration Badge Text</label>
            <input type="text" id="c-badge" value="${course.degreeBadge}" placeholder="e.g. 5 YEARS INTEGRATED" />
          </div>
          <div class="edit-input-group">
            <label for="c-badge-color">Badge Color Theme</label>
            <select id="c-badge-color">
              <option value="gold" ${course.badgeColor === 'gold' ? 'selected' : ''}>Gold Ribbon</option>
              <option value="blue" ${course.badgeColor === 'blue' ? 'selected' : ''}>Royal Blue Ribbon</option>
              <option value="emerald" ${course.badgeColor === 'emerald' ? 'selected' : ''}>Emerald Ribbon</option>
            </select>
          </div>
          <div class="edit-input-group">
            <label for="c-icon">Icon Symbol / Emoji</label>
            <input type="text" id="c-icon" value="${course.icon || '⚖️'}" placeholder="⚖️, 📖, 🏛️, 🎓" />
          </div>
        </div>

        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="c-duration">Duration Breakdown</label>
            <input type="text" id="c-duration" value="${course.duration}" placeholder="e.g. 5 Academic Years (10 Semesters)" />
          </div>
          <div class="edit-input-group">
            <label for="c-seats">Annual Seat Intake</label>
            <input type="text" id="c-seats" value="${course.annualSeats || ''}" placeholder="e.g. 60 Seats" />
          </div>
        </div>

        <div class="edit-grid-2">
          <div class="edit-input-group">
            <label for="c-aff">Affiliating University</label>
            <input type="text" id="c-aff" value="${course.affiliation}" placeholder="SSJ University, Almora" />
          </div>
          <div class="edit-input-group">
            <label for="c-appr">Statutory Approval</label>
            <input type="text" id="c-appr" value="${course.approval}" placeholder="Bar Council of India (BCI)" />
          </div>
        </div>

        <div class="edit-input-group">
          <label for="c-elig">Eligibility Criteria Code</label>
          <input type="text" id="c-elig" value="${course.eligibilityCode || ''}" placeholder="ELIGIBILITY: 10+2 (ANY STREAM)" />
        </div>

        <div class="edit-input-group">
          <label for="c-tags">Curriculum Modules / Highlights (comma-separated)</label>
          <input type="text" id="c-tags" value="${(course.curriculumTags || []).join(', ')}" placeholder="Constitutional Law, Criminal Justice, Cyber Laws" />
        </div>

        <div style="display:flex; gap:16px; align-items:center; margin-top:12px; padding:12px; background:var(--slc-bg); border-radius:8px;">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.86rem; font-weight:600;">
            <input type="checkbox" id="c-featured" ${course.isFeatured ? 'checked' : ''} />
            <span>Mark as Highlighted / Most Popular Course</span>
          </label>
          <input type="text" id="c-feat-lbl" value="${course.featuredLabel || 'MOST POPULAR'}" placeholder="Tag Text (e.g. MOST POPULAR)" style="width:140px; padding:4px 8px; font-size:0.8rem;" />
        </div>

        <div class="cms-modal-footer">
          <button type="button" class="btn-secondary" id="btn-cancel-course">Cancel</button>
          <button type="submit" class="btn-primary">
            ${isEditing ? 'Save Course Changes' : '+ Add Programme'}
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.classList.add('open');

  // Close handlers
  const close = () => {
    overlay.classList.remove('open');
    editingCourseId = null;
  };

  document.getElementById('btn-close-course-modal').addEventListener('click', close);
  document.getElementById('btn-cancel-course').addEventListener('click', close);

  // Form submit
  document.getElementById('course-editor-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('c-title').value.trim();
    const code = document.getElementById('c-code').value.trim();
    const subtitle = document.getElementById('c-subtitle').value.trim();
    const description = document.getElementById('c-desc').value.trim();
    const degreeBadge = document.getElementById('c-badge').value.trim() || 'ACCREDITED';
    const badgeColor = document.getElementById('c-badge-color').value;
    const icon = document.getElementById('c-icon').value.trim() || '⚖️';
    const duration = document.getElementById('c-duration').value.trim() || 'Regular Semester System';
    const annualSeats = document.getElementById('c-seats').value.trim();
    const affiliation = document.getElementById('c-aff').value.trim() || 'SSJ University, Almora';
    const approval = document.getElementById('c-appr').value.trim() || 'Bar Council of India (BCI)';
    const eligibilityCode = document.getElementById('c-elig').value.trim();
    const rawTags = document.getElementById('c-tags').value;
    const curriculumTags = rawTags.split(',').map(t => t.trim()).filter(Boolean);
    const isFeatured = document.getElementById('c-featured').checked;
    const featuredLabel = document.getElementById('c-feat-lbl').value.trim();

    const updatedCourse = {
      id: editingCourseId || ('course-' + Date.now().toString(36)),
      title,
      code,
      subtitle,
      description,
      degreeBadge,
      badgeColor,
      icon,
      duration,
      annualSeats,
      affiliation,
      approval,
      eligibilityCode,
      curriculumTags,
      isFeatured,
      featuredLabel: isFeatured ? featuredLabel : '',
      heroDesc: subtitle || duration
    };

    if (editingCourseId) {
      const idx = currentConfig.courses.findIndex(c => c.id === editingCourseId);
      if (idx !== -1) {
        currentConfig.courses[idx] = updatedCourse;
      }
    } else {
      currentConfig.courses.push(updatedCourse);

      // Also ensure it is present in the admission form program dropdown options
      const existsInDropdown = currentConfig.formConfig.programOptions.some(p => p.value === code || p.value === title);
      if (!existsInDropdown) {
        currentConfig.formConfig.programOptions.push({
          id: updatedCourse.id,
          value: code,
          label: `${code} (${title})`
        });
      }
    }

    close();
    syncInputsToConfig();
    showToast(`⏳ Saving course "${title}"...`, 'info');
    const saved = await SiteConfigService.saveConfig(currentConfig, (editingCourseId ? 'Updated course: ' : 'Added new course: ') + title, 'Web Administrator');
    renderDashboard();
    if (saved) {
      showToast(`✓ Course "${title}" saved and published to live website!`, 'success');
    } else {
      showToast(`⚠️ Saved locally, server sync failed.`, 'warning');
    }
  });
}

/**
 * Attach Dashboard Interaction Handlers
 */
function attachDashboardEvents() {
  // Tab Switching
  document.querySelectorAll('.edit-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      syncInputsToConfig();
      currentTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.edit-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.edit-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`panel-${currentTab}`);
      if (panel) panel.classList.add('active');
    });
  });

  // Logout
  document.getElementById('btn-logout').addEventListener('click', () => {
    EditAuthService.logout();
    showToast('Logged out of Website Editor.', 'success');
    renderApp();
  });

  // Add Course Button
  const addCourseBtn = document.getElementById('btn-add-course');
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', () => openCourseModal(null));
  }

  // Edit Course Buttons
  document.querySelectorAll('.btn-edit-course').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const course = currentConfig.courses.find(c => c.id === id);
      if (course) openCourseModal(course);
    });
  });

  // Delete Course Buttons
  document.querySelectorAll('.btn-delete-course').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const courseToDelete = currentConfig.courses.find(c => c.id === id);
      if (confirm(`Are you sure you want to delete the course "${title}" from the website?`)) {
        syncInputsToConfig();

        // 1. Remove course from array
        currentConfig.courses = currentConfig.courses.filter(c => c.id !== id);

        // 2. Remove associated programOption from form dropdown (by id, code, or value)
        const codeClean = (courseToDelete?.code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        currentConfig.formConfig.programOptions = (currentConfig.formConfig.programOptions || []).filter(p => {
          if (p.id === id) return false;
          if (courseToDelete?.id && p.id === courseToDelete.id) return false;
          // Match initial course IDs e.g. "llm" for "llm-2yr" or "ba-llb" for "ba-llb-5yr"
          if (id.startsWith(p.id) || p.id.startsWith(id.split('-')[0])) return false;
          const pCodeClean = (p.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          if (codeClean && pCodeClean && (codeClean.includes(pCodeClean) || pCodeClean.includes(codeClean))) return false;
          if (courseToDelete?.code && p.value && p.value.toLowerCase().includes(courseToDelete.code.toLowerCase())) return false;
          if (courseToDelete?.title && p.value && p.value.toLowerCase().includes(courseToDelete.title.toLowerCase())) return false;
          return true;
        });

        showToast(`⏳ Deleting "${title}" and saving to server...`, 'info');
        btn.disabled = true;
        const saved = await SiteConfigService.saveConfig(currentConfig, `Deleted course: ${title}`, 'Web Administrator');
        renderDashboard();
        if (saved) {
          showToast(`✓ Course "${title}" deleted and saved to disk.`, 'success');
        } else {
          showToast(`⚠️ Course deleted locally, server sync failed.`, 'warning');
        }
      }
    });
  });

  // Add Faculty Button
  const addFacBtn = document.getElementById('btn-add-faculty');
  if (addFacBtn) {
    addFacBtn.addEventListener('click', () => openFacultyModal(null));
  }

  // Edit Faculty Buttons
  document.querySelectorAll('.btn-edit-fac').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const fac = (currentConfig.faculty || []).find(f => f.id === id);
      if (fac) openFacultyModal(fac);
    });
  });

  // Delete Faculty Buttons
  document.querySelectorAll('.btn-delete-fac').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      if (confirm(`Are you sure you want to remove faculty member "${name}" from the directory?`)) {
        syncInputsToConfig();
        currentConfig.faculty = (currentConfig.faculty || []).filter(f => f.id !== id);
        showToast(`⏳ Deleting "${name}"...`, 'info');
        btn.disabled = true;
        const saved = await SiteConfigService.saveConfig(currentConfig, `Deleted faculty profile: ${name}`, 'Web Administrator');
        renderDashboard();
        if (saved) {
          showToast(`✓ Faculty profile "${name}" deleted from directory.`, 'success');
        } else {
          showToast(`⚠️ Profile deleted locally, server sync failed.`, 'warning');
        }
      }
    });
  });

  // Category Filter in CMS Faculty Tab
  document.querySelectorAll('.btn-filter-cms-fac').forEach(btn => {
    btn.addEventListener('click', () => {
      facultyCategoryFilter = btn.getAttribute('data-cat') || 'all';
      renderDashboard();
    });
  });

  // Form Program Options Handlers
  const addProgOptBtn = document.getElementById('btn-add-prog-opt');
  if (addProgOptBtn) {
    addProgOptBtn.addEventListener('click', async () => {
      const valInput = document.getElementById('new-prog-opt-val');
      const lblInput = document.getElementById('new-prog-opt-lbl');
      const val = valInput.value.trim();
      const lbl = lblInput.value.trim() || val;
      if (!val) {
        alert('Please enter a value for the programme option.');
        return;
      }
      syncInputsToConfig();
      currentConfig.formConfig.programOptions.push({
        id: 'opt-' + Date.now().toString(36),
        value: val,
        label: lbl
      });
      showToast(`⏳ Saving program option...`, 'info');
      addProgOptBtn.disabled = true;
      const saved = await SiteConfigService.saveConfig(currentConfig, `Added program option: ${lbl}`, 'Web Administrator');
      renderDashboard();
      if (saved) {
        showToast(`✓ Program option "${lbl}" added.`, 'success');
      } else {
        showToast(`⚠️ Saved locally, server sync failed.`, 'warning');
      }
    });
  }

  document.querySelectorAll('.btn-del-prog-opt').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const opt = currentConfig.formConfig.programOptions[idx];
      const optLabel = opt ? (opt.label || opt.value) : 'Option';
      syncInputsToConfig();
      currentConfig.formConfig.programOptions.splice(idx, 1);
      showToast(`⏳ Removing option...`, 'info');
      btn.disabled = true;
      const saved = await SiteConfigService.saveConfig(currentConfig, `Removed program option: ${optLabel}`, 'Web Administrator');
      renderDashboard();
      if (saved) {
        showToast(`✓ Program option "${optLabel}" removed.`, 'success');
      } else {
        showToast(`⚠️ Saved locally, server sync failed.`, 'warning');
      }
    });
  });

  // Form State Options Handlers
  const addStateOptBtn = document.getElementById('btn-add-state-opt');
  if (addStateOptBtn) {
    addStateOptBtn.addEventListener('click', async () => {
      const input = document.getElementById('new-state-opt');
      const val = input.value.trim();
      if (!val) {
        alert('Please enter a state name.');
        return;
      }
      if (!currentConfig.formConfig.stateOptions.includes(val)) {
        syncInputsToConfig();
        currentConfig.formConfig.stateOptions.push(val);
        showToast(`⏳ Saving state...`, 'info');
        addStateOptBtn.disabled = true;
        const saved = await SiteConfigService.saveConfig(currentConfig, `Added state option: ${val}`, 'Web Administrator');
        renderDashboard();
        if (saved) {
          showToast(`✓ State "${val}" added.`, 'success');
        } else {
          showToast(`⚠️ Saved locally, server sync failed.`, 'warning');
        }
      } else {
        alert('State already exists in list.');
      }
    });
  }

  document.querySelectorAll('.btn-del-state-opt').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const st = currentConfig.formConfig.stateOptions[idx];
      syncInputsToConfig();
      currentConfig.formConfig.stateOptions.splice(idx, 1);
      showToast(`⏳ Removing state...`, 'info');
      btn.disabled = true;
      const saved = await SiteConfigService.saveConfig(currentConfig, `Removed state option: ${st}`, 'Web Administrator');
      renderDashboard();
      if (saved) {
        showToast(`✓ State "${st}" removed.`, 'success');
      } else {
        showToast(`⚠️ Saved locally, server sync failed.`, 'warning');
      }
    });
  });

  // Change Password Form
  const changePassForm = document.getElementById('change-pass-form');
  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const curr = document.getElementById('curr-pass').value;
      const next = document.getElementById('new-pass').value;
      const conf = document.getElementById('confirm-pass').value;

      if (next !== conf) {
        alert('New passwords do not match.');
        return;
      }

      const res = await EditAuthService.changePassword(curr, next);
      if (res.success) {
        showToast('Administrator password changed successfully!', 'success');
        changePassForm.reset();
      } else {
        alert(res.error);
      }
    });
  }

  // Export JSON
  const exportBtn = document.getElementById('btn-export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(SiteConfigService.exportConfigJson());
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", `soarghaati_site_config_${new Date().toISOString().split('T')[0]}.json`);
      dlAnchor.click();
      showToast('Configuration exported as JSON.', 'success');
    });
  }

  // Import JSON
  const importInput = document.getElementById('file-import-json');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = SiteConfigService.importConfigJson(event.target.result);
        if (res.success) {
          showToast('Configuration imported successfully!', 'success');
          renderDashboard(true);
        } else {
          alert('Import failed: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to Factory Defaults
  const resetBtn = document.getElementById('btn-reset-factory');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('DANGER: Are you sure you want to reset all courses, form dropdowns, and settings to the factory defaults? Any custom courses added will be cleared.')) {
        SiteConfigService.resetToDefaults('Principal / Admin Editor');
        showToast('All parameters reset to factory default.', 'success');
        renderDashboard(true);
      }
    });
  }

  // Live input sync listeners
  const liveInputIds = [
    'form-heading', 'form-subheading', 'form-submit-text',
    'contact-phone-primary', 'contact-wa-number', 'contact-email',
    'inst-name', 'inst-tagline', 'inst-address',
    'top-announcement-text', 'academic-year-text', 'brochure-url'
  ];
  liveInputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => syncInputsToConfig());
      el.addEventListener('change', () => syncInputsToConfig());
    }
  });

  // Checkbox listeners with immediate persistence
  const fieldCheckboxes = [
    { id: 'field-name', key: 'nameRequired', label: 'Candidate Name' },
    { id: 'field-mobile', key: 'mobileRequired', label: 'Mobile Number' },
    { id: 'field-program', key: 'programRequired', label: 'Desired Programme' },
    { id: 'field-qual', key: 'qualificationRequired', label: 'Qualification' },
    { id: 'field-state', key: 'stateRequired', label: 'State' },
    { id: 'field-city', key: 'cityRequired', label: 'City' }
  ];
  fieldCheckboxes.forEach(({ id, key, label }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', async () => {
        syncInputsToConfig();
        showToast(`⏳ Updating ${label}...`, 'info');
        await SiteConfigService.saveConfig(currentConfig, `Changed ${label} to ${el.checked ? 'Mandatory' : 'Optional'}`, 'Web Administrator');
        showToast(`✓ Field "${label}" is now ${el.checked ? 'Required' : 'Optional'}.`, 'success');
      });
    }
  });

  // Unified Save Handler
  const handleSaveAction = async (sourceLabel = 'Website Parameters') => {
    syncInputsToConfig();
    showToast(`⏳ Saving ${sourceLabel}...`, 'info');
    const success = await SiteConfigService.saveConfig(currentConfig, `Saved & published ${sourceLabel}`, 'Web Administrator');
    if (success) {
      showToast(`🎉 ${sourceLabel} saved and permanently published! Live website updated instantly.`, 'success');
    } else {
      showToast('Error saving changes to local storage.', 'error');
    }
  };

  // Save Buttons
  const saveAllBtn = document.getElementById('btn-save-all');
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', () => handleSaveAction('All Website Parameters'));
  }

  const saveFormBtn = document.getElementById('btn-save-form');
  if (saveFormBtn) {
    saveFormBtn.addEventListener('click', () => handleSaveAction('Form Settings & Dropdowns'));
  }

  const saveContactBtn = document.getElementById('btn-save-contact');
  if (saveContactBtn) {
    saveContactBtn.addEventListener('click', () => handleSaveAction('Helplines & Contacts'));
  }

  const saveAnnBtn = document.getElementById('btn-save-announcements');
  if (saveAnnBtn) {
    saveAnnBtn.addEventListener('click', () => handleSaveAction('Announcements & Brochure'));
  }
}

// Initial Boot with server disk sync
(async () => {
  try {
    currentConfig = await SiteConfigService.initConfig();
  } catch (e) {
    console.warn('[AdminEdit] Config hydration failed on boot:', e);
  }
  renderApp();
})();
