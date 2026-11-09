/**
 * ==============================================================================
 * FACULTY & ACADEMIC DIRECTORY SCRIPT — Soarghaati Law College
 * ==============================================================================
 */

import { SiteConfigService } from '../AdminEdit/services/siteConfigService.js';

// Application State
let config = SiteConfigService.getConfig();
let facultyList = config.faculty || [];
let activeCategory = 'all';
let searchQuery = '';

// DOM Elements
const gridContainer = document.getElementById('faculty-grid');
const emptyState = document.getElementById('faculty-empty-state');
const searchInput = document.getElementById('faculty-search-input');
const clearSearchBtn = document.getElementById('faculty-search-clear');
const filterPillsContainer = document.getElementById('faculty-filter-pills');
const showingText = document.getElementById('faculty-showing-text');
const resetFiltersBtn = document.getElementById('btn-reset-filters');

// Modal Elements
const applyModal = document.getElementById('apply-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalForm = document.getElementById('modal-enquiry-form');
const modalFormContent = document.getElementById('modal-form-content');
const modalSuccessContent = document.getElementById('modal-success-content');
const openModalBtns = document.querySelectorAll('.open-modal-btn');

// Mobile Nav Toggle
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const collegeNavMenu = document.getElementById('college-nav-menu');

/**
 * Synchronize institutional metadata (phones, whatsapp, emails, announcements, dropdowns)
 */
function applyInstitutionalConfig(cfg) {
  if (!cfg) return;
  const { institution, formConfig, courses } = cfg;

  // 1. Top Strip Announcement Ticker & Academic Batch
  const announcementEl = document.querySelector('.strip-text');
  if (announcementEl && institution?.topAnnouncement) {
    announcementEl.innerHTML = institution.topAnnouncement;
  }
  const stripBadge = document.querySelector('.strip-badge');
  if (stripBadge && institution?.academicYear) {
    stripBadge.textContent = `ADMISSIONS ${institution.academicYear}`;
  }

  // 2. Primary Helplines & WhatsApp numbers
  const primaryPhone = institution?.phonePrimary || '+91 7830201028';
  const cleanPhone = primaryPhone.replace(/\s+/g, '');
  const waNum = (institution?.whatsappNumber || '917830201028').replace(/[^0-9]/g, '');

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:${cleanPhone}`;
  });

  const stripPhoneSpan = document.querySelector('.strip-phone-link span');
  if (stripPhoneSpan) stripPhoneSpan.textContent = `Helpline: ${primaryPhone}`;

  const footerPhone = document.querySelector('.footer-contact-block a[href^="tel:"]');
  if (footerPhone) footerPhone.textContent = primaryPhone;

  // WhatsApp links update
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    const curHref = link.getAttribute('href');
    if (curHref) {
      link.setAttribute('href', curHref.replace(/wa\.me\/[0-9]+/, `wa.me/${waNum}`));
    }
  });

  // Email links update
  if (institution?.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.href = `mailto:${institution.email}`;
      const span = link.querySelector('span');
      if (span) span.textContent = institution.email;
    });
  }

  // Campus Address update
  if (institution?.address) {
    const addrEl = document.querySelector('.footer-address');
    if (addrEl) {
      addrEl.innerHTML = `<strong>Campus Address:</strong><br>${institution.address.replace(/\n/g, '<br>')}`;
    }
  }

  // Brochure links
  if (institution?.brochureUrl) {
    document.querySelectorAll('.btn-download-brochure').forEach(btn => {
      btn.href = institution.brochureUrl;
    });
    const dlLink = document.getElementById('btn-brochure-download-link');
    if (dlLink) dlLink.href = institution.brochureUrl;
  }

  // Form Dropdown: Course / Program
  const modalProgSelect = document.getElementById('m-prog');
  if (modalProgSelect) {
    const curVal = modalProgSelect.value;
    modalProgSelect.innerHTML = '<option value="" disabled selected>-- Select Desired Programme --</option>';

    let options = [];
    if (Array.isArray(formConfig?.programOptions) && formConfig.programOptions.length > 0) {
      options = formConfig.programOptions;
    } else if (Array.isArray(courses) && courses.length > 0) {
      options = courses.map(c => ({
        id: c.id,
        value: c.title,
        label: `${c.title} (${c.degreeBadge || c.duration || 'Degree'})`
      }));
    } else {
      options = [
        { id: 'ba-llb-5yr', value: 'B.A. LL.B (5-Year)', label: 'B.A. LL.B (5-Year Integrated Course - After 10+2)' },
        { id: 'llb-3yr', value: 'LL.B (3-Year)', label: 'LL.B (3-Year Professional Course - After Graduation)' }
      ];
    }

    options.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt.value || opt.label;
      optEl.textContent = opt.label || opt.value;
      modalProgSelect.appendChild(optEl);
    });
    if (curVal && options.some(o => (o.value || o.label) === curVal)) {
      modalProgSelect.value = curVal;
    }
  }

  // Form Dropdown: State
  const modalStateSelect = document.getElementById('m-state');
  if (modalStateSelect && formConfig?.stateOptions) {
    const curVal = modalStateSelect.value;
    modalStateSelect.innerHTML = '<option value="" disabled selected>Select State</option>';
    formConfig.stateOptions.forEach(st => {
      const optEl = document.createElement('option');
      optEl.value = st;
      optEl.textContent = st;
      modalStateSelect.appendChild(optEl);
    });
    if (curVal) modalStateSelect.value = curVal;
  }

  // Dynamic Header Navbar 'Programmes' Dropdown
  const progDropdown = document.querySelector('.nav-item-wrap.has-dropdown a[href*="programs"] + .nav-dropdown-menu');
  if (progDropdown && courses && courses.length > 0) {
    progDropdown.innerHTML = `
      ${courses.map(c => `
        <a href="/#programs" class="dropdown-link">
          <strong>${c.title}</strong>
          <span class="dd-desc">${c.heroDesc || c.subtitle || c.duration}</span>
        </a>
      `).join('')}
      <a href="/#what-you-learn" class="dropdown-link">Curriculum &amp; Clinical Legal Education</a>
    `;
  }

  // Dynamic Footer 'Programmes' List
  const allColTitles = Array.from(document.querySelectorAll('.footer-col-title'));
  const footerProgTitle = allColTitles.find(el => el.textContent.trim().toLowerCase() === 'programmes');
  if (footerProgTitle && footerProgTitle.nextElementSibling && courses && courses.length > 0) {
    footerProgTitle.nextElementSibling.innerHTML = `
      ${courses.map(c => `
        <li><a href="/#programs">${c.code || c.title} (${c.degreeBadge || c.duration})</a></li>
      `).join('')}
      <li><a href="/#what-you-learn">Moot Court &amp; Trial Advocacy</a></li>
      <li><a href="/#what-you-learn">Legal Aid &amp; Clinical Education</a></li>
    `;
  }
}

/**
 * Initialize Faculty Page
 */
function init() {
  applyInstitutionalConfig(config);
  updateCounts();
  renderFaculty();
  attachEvents();
  setupModalHandlers();
  setupMobileNav();

  // Asynchronously hydrate latest configuration from disk/server to guarantee persistence
  SiteConfigService.initConfig().then((updatedConfig) => {
    config = updatedConfig || SiteConfigService.getConfig();
    facultyList = config.faculty || [];
    applyInstitutionalConfig(config);
    updateCounts();
    renderFaculty();
  }).catch((err) => {
    console.warn('[faculty.js] Server config hydration note:', err);
  });

  // Listen for real-time config updates dispatched by AdminEdit
  window.addEventListener('slc_site_config_updated', (e) => {
    config = e.detail || SiteConfigService.getConfig();
    facultyList = config.faculty || [];
    applyInstitutionalConfig(config);
    updateCounts();
    renderFaculty();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'slc_site_config_v1') {
      config = SiteConfigService.getConfig();
      facultyList = config.faculty || [];
      applyInstitutionalConfig(config);
      updateCounts();
      renderFaculty();
    }
  });
}

/**
 * Compute Initials for Avatar Fallback
 */
function getInitials(name = '') {
  // Strip salutations like Mr., Dr., Miss, Smt.
  const clean = name.replace(/^(Mr\.|Dr\.|Miss|Mrs\.|Smt\.|Prof\.)\s*/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'LC';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Determine Role Badge Theme & Icon
 */
function getRoleBadge(designation = '', category = '') {
  const lowerDesig = designation.toLowerCase();
  if (lowerDesig.includes('principal')) {
    return { text: '🏛️ Principal & Head of Institution', className: 'gold' };
  }
  if (lowerDesig.includes('professor')) {
    return { text: '⚖️ Assistant Professor', className: 'blue' };
  }
  if (lowerDesig.includes('librarian')) {
    return { text: '📚 Librarian', className: 'purple' };
  }
  if (category === 'admin') {
    return { text: '🏢 Administrative Staff', className: 'emerald' };
  }
  return { text: '🤝 Campus Support', className: 'slate' };
}

/**
 * Update Filter Counts
 */
function updateCounts() {
  const counts = {
    all: facultyList.length,
    law: facultyList.filter(f => f.category === 'law').length,
    humanities: facultyList.filter(f => f.category === 'humanities').length,
    library: facultyList.filter(f => f.category === 'library').length,
    admin: facultyList.filter(f => f.category === 'admin').length,
    support: facultyList.filter(f => f.category === 'support').length
  };

  for (const [key, val] of Object.entries(counts)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.innerText = val;
  }
}

/**
 * Filter & Render Faculty List
 */
function renderFaculty() {
  const query = searchQuery.trim().toLowerCase();

  const filtered = facultyList.filter(member => {
    const matchesCategory = activeCategory === 'all' || member.category === activeCategory;
    if (!matchesCategory) return false;

    if (!query) return true;

    const nameMatch = (member.name || '').toLowerCase().includes(query);
    const desigMatch = (member.designation || '').toLowerCase().includes(query);
    const subMatch = (member.subject || '').toLowerCase().includes(query);
    const qualMatch = (member.qualification || '').toLowerCase().includes(query);
    const deptMatch = (member.department || '').toLowerCase().includes(query);

    return nameMatch || desigMatch || subMatch || qualMatch || deptMatch;
  });

  // Update text
  if (showingText) {
    showingText.innerHTML = `Showing <strong>${filtered.length}</strong> of ${facultyList.length} verified academic &amp; staff profiles`;
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  gridContainer.innerHTML = filtered.map((member) => {
    const isPrincipal = (member.designation || '').toLowerCase().includes('principal');
    const badge = getRoleBadge(member.designation, member.category);
    const initials = getInitials(member.name);

    return `
      <article class="faculty-card ${isPrincipal ? 'principal-card' : ''}" data-id="${member.id}">
        
        <!-- Circular Avatar Format -->
        <div class="fac-avatar-wrap">
          <div class="faculty-avatar-circle">
            ${member.photo ? `
              <img src="${member.photo}" alt="${member.name}" class="faculty-avatar-img" loading="lazy" />
            ` : `
              <div class="faculty-avatar-initials ${isPrincipal ? 'gold-theme' : ''}">
                <span>${initials}</span>
                <span class="avatar-crest-sub">⚖️</span>
              </div>
            `}
          </div>
        </div>

        <div class="fac-details-col">
          <!-- Role Badge -->
          <div class="fac-badge-row">
            <span class="faculty-role-badge ${badge.className}">${badge.text}</span>
          </div>

          <!-- Name & Department -->
          <h2 class="faculty-name">${member.name}</h2>
          <div class="faculty-dept">${member.department || 'Faculty of Law'}</div>

          <!-- Qualifications & Teaching Areas -->
          <div class="faculty-meta-box">
            <div class="meta-item">
              <span class="meta-item-lbl">Qualifications:</span>
              <span class="meta-item-val">${member.qualification || 'N/A'}</span>
            </div>

            <div class="meta-item">
              <span class="meta-item-lbl">Teaching Subject / Role:</span>
              <span class="meta-item-val highlight-sub">${member.subject || 'Law Studies'}</span>
            </div>
          </div>
        </div>

      </article>
    `;
  }).join('');
}

/**
 * Event Handlers
 */
function attachEvents() {
  // Category Filter Pills
  filterPillsContainer?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-pill');
    if (!btn) return;

    filterPillsContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategory = btn.dataset.category || 'all';
    renderFaculty();
  });

  // Search Input
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    renderFaculty();
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderFaculty();
    searchInput.focus();
  });

  resetFiltersBtn?.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    activeCategory = 'all';
    filterPillsContainer.querySelectorAll('.filter-pill').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
    renderFaculty();
  });
}

/**
 * Mobile Navigation Menu Handler
 */
function setupMobileNav() {
  if (!mobileNavToggle || !collegeNavMenu) return;

  mobileNavToggle.addEventListener('click', () => {
    mobileNavToggle.classList.toggle('open');
    collegeNavMenu.classList.toggle('open');
  });

  // Mobile dropdown items toggle
  const dropdownWraps = collegeNavMenu.querySelectorAll('.nav-item-wrap.has-dropdown');
  dropdownWraps.forEach(wrap => {
    const trigger = wrap.querySelector('.nav-item');
    trigger?.addEventListener('click', (e) => {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        wrap.classList.toggle('open-mobile-dd');
      }
    });
  });
}

/**
 * Brochure Modal Handlers
 */
function setupModalHandlers() {
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (applyModal) applyModal.classList.add('open');
    });
  });

  modalCloseBtn?.addEventListener('click', () => {
    if (applyModal) applyModal.classList.remove('open');
  });

  applyModal?.addEventListener('click', (e) => {
    if (e.target === applyModal) {
      applyModal.classList.remove('open');
    }
  });

  modalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (modalFormContent) modalFormContent.style.display = 'none';
    if (modalSuccessContent) modalSuccessContent.style.display = 'block';

    const name = document.getElementById('m-name')?.value || '';
    const phone = document.getElementById('m-phone')?.value || '';
    const prog = document.getElementById('m-prog')?.value || 'B.A. LL.B';
    const qual = document.getElementById('m-qual')?.value || '';
    const state = document.getElementById('m-state')?.value || '';
    const city = document.getElementById('m-city')?.value || '';

    // Persist directly to Hostinger Server Database (SQLite & JSON)
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: name,
          mobile: phone,
          email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`,
          course: prog,
          percentage: qual,
          state,
          city,
          source: 'Faculty Page Admission Modal'
        })
      }).catch(err => console.warn('Could not sync lead to server:', err));
    } catch (netErr) {}

    // Trigger immediate download
    const dlLink = document.getElementById('btn-brochure-download-link');
    if (dlLink) {
      setTimeout(() => {
        dlLink.click();
      }, 400);
    }
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
