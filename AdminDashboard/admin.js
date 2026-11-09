/**
 * ==============================================================================
 * SOARGHAATI LAW COLLEGE — SIMPLE & LIGHTWEIGHT ADMISSION DASHBOARD
 * ==============================================================================
 * Designed specifically for 20-30 leads/month:
 * - Simple, clean single-view admissions desk
 * - Instant WhatsApp & Call buttons
 * - 1-Click inline status changes
 * - Quick search & filter chips (All, New, Contacted, Follow-up, Admitted)
 * - Quick modal for details & internal notes
 * - 100% lightweight & mobile friendly
 * ==============================================================================
 */

import { AuthService } from './services/authService.js';
import { LeadService, VALID_STATUSES, VALID_COURSES } from './services/leadService.js';
import { ExportService } from './services/exportService.js';
import { AuditService } from './services/auditService.js';

class AdminApp {
  constructor() {
    this.root = document.getElementById('admin-app');
    this.toastContainer = document.getElementById('admin-toasts');
    
    this.state = {
      search: '',
      course: 'ALL',
      status: 'ALL',
      month: 'ALL',
      pageSize: 10,
      page: 1,
      selectedLeadId: null
    };

    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const targetRoute = link.getAttribute('data-route');
        this.navigateTo(targetRoute);
      }
    });

    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    this.handleRoute();
  }

  navigateTo(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.handleRoute();
  }

  parseLocation() {
    let route = window.location.pathname;
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      route = '/AdminDashboard' + window.location.hash.substring(1);
    }
    if (route.length > 1 && route.endsWith('/')) {
      route = route.slice(0, -1);
    }

    const detailMatch = route.match(/^\/AdminDashboard\/Leads\/([A-Za-z0-9\-_]+)$/i);
    if (detailMatch) {
      return { name: 'DETAIL', id: detailMatch[1] };
    }
    if (route.toLowerCase() === '/admindashboard/settings') {
      return { name: 'SETTINGS' };
    }
    if (route.toLowerCase() === '/admindashboard' && !AuthService.isAuthenticated()) {
      return { name: 'LOGIN' };
    }
    // Main easy dashboard
    return { name: 'DASHBOARD' };
  }

  handleRoute() {
    const route = this.parseLocation();
    const isAuth = AuthService.isAuthenticated();

    if (!isAuth && route.name !== 'LOGIN') {
      this.renderLoginView();
      return;
    }
    if (isAuth && route.name === 'LOGIN') {
      this.renderMainDashboard();
      return;
    }

    if (route.name === 'LOGIN') {
      this.renderLoginView();
    } else if (route.name === 'SETTINGS') {
      this.renderSettingsView();
    } else if (route.name === 'DETAIL') {
      this.renderMainDashboard();
      this.openLeadModal(route.id);
    } else {
      this.renderMainDashboard();
    }
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    toast.innerHTML = `<span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // ============================================================================
  // VIEW: SIMPLE ADMIN LOGIN
  // ============================================================================
  renderLoginView() {
    this.root.innerHTML = `
      <div class="simple-login-wrap">
        <div class="simple-login-box">
          <div class="login-brand">
            <div class="brand-crest-mini"><img src="/college-logo.png" alt="Soar Ghaati Law College Logo" style="width:56px; height:56px; object-fit:contain;" /></div>
            <h2>Soarghaati Law College</h2>
            <p>Admissions Portal Login</p>
          </div>

          <form id="simple-login-form">
            <div id="login-err-box" class="login-error-msg" style="display:none;"></div>

            <div class="form-field">
              <label>Official Email</label>
              <input type="email" id="login-email" class="clean-input" placeholder="admin@soarghaati.edu.in" required />
            </div>

            <div class="form-field">
              <label>Password</label>
              <div class="input-pwd-row">
                <input type="password" id="login-password" class="clean-input" placeholder="••••••••" required />
                <button type="button" id="toggle-pwd-btn" class="clean-toggle-btn">Show</button>
              </div>
            </div>

            <button type="submit" id="login-btn" class="simple-btn-primary">
              <span id="login-btn-label">Sign In</span>
            </button>
          </form>

          <div style="text-align:center; margin-top:20px;">
            <a href="/" class="clean-link">&larr; Back to College Website</a>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('simple-login-form');
    const emailInput = document.getElementById('login-email');
    const pwdInput = document.getElementById('login-password');
    const toggleBtn = document.getElementById('toggle-pwd-btn');
    const errBox = document.getElementById('login-err-box');
    const submitBtn = document.getElementById('login-btn');
    const btnLabel = document.getElementById('login-btn-label');

    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.textContent = isPwd ? 'Hide' : 'Show';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errBox.style.display = 'none';
      submitBtn.disabled = true;
      btnLabel.textContent = 'Checking...';

      try {
        const res = await AuthService.login(emailInput.value, pwdInput.value);
        if (res.success) {
          this.showToast(`Welcome! Signed in successfully.`, 'success');
          this.navigateTo('/AdminDashboard');
        } else {
          errBox.textContent = res.error || 'Login failed.';
          errBox.style.display = 'block';
          submitBtn.disabled = false;
          btnLabel.textContent = 'Sign In';
        }
      } catch (err) {
        errBox.textContent = 'Connection error. Please try again.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        btnLabel.textContent = 'Sign In';
      }
    });
  }

  // ============================================================================
  // VIEW: MAIN EASY ADMISSIONS DESK
  // ============================================================================
  async renderMainDashboard() {
    const user = AuthService.getCurrentUser() || { name: 'Admissions Desk' };
    const availableMonths = LeadService.getAvailableMonths();
    const stats = await LeadService.getDashboardStats(this.state.month);
    const monthTotalLeads = stats.cards.totalEnquiries;

    const leadsResult = await LeadService.getLeads({
      search: this.state.search,
      course: this.state.course,
      status: this.state.status,
      month: this.state.month,
      page: this.state.page,
      pageSize: this.state.pageSize
    });

    const displayedCount = leadsResult.data.length;
    const filteredTotal = leadsResult.total;
    const isFilteredByOther = Boolean(this.state.search || this.state.course !== 'ALL' || this.state.status !== 'ALL');
    const selectedMonthObj = availableMonths.find(m => m.key === this.state.month);
    const selectedMonthLabel = selectedMonthObj ? selectedMonthObj.label : 'All Months';

    this.root.innerHTML = `
      <div class="simple-app-shell">
        <!-- Clean Modern Navbar -->
        <header class="simple-navbar">
          <div class="navbar-brand">
            <span class="navbar-crest"><img src="/college-logo.png" alt="Soar Ghaati Law College Logo" style="width:36px; height:36px; object-fit:contain;" /></span>
            <div>
              <h1 class="navbar-title">Soarghaati Law College</h1>
              <span class="navbar-subtitle">Admissions Desk</span>
            </div>
          </div>

          <div class="navbar-actions">
            <button type="button" id="export-csv-btn" class="simple-btn-outline" title="Download Excel/CSV">
              📥 <span class="hide-mobile">Export CSV</span>
            </button>
            <a href="/AdminDashboard/Settings" data-route="/AdminDashboard/Settings" class="simple-btn-outline" title="Settings">
              ⚙️ <span class="hide-mobile">Settings</span>
            </a>
            <button type="button" id="logout-btn" class="simple-btn-logout" title="Sign Out">
              Sign Out
            </button>
          </div>
        </header>

        <!-- Main Body -->
        <main class="simple-container">
          <!-- Top Row: Search, Month Filter & Course Filter -->
          <div class="simple-top-bar">
            <!-- Search Input -->
            <div class="search-box-wrap">
              <span class="search-icon">🔍</span>
              <input type="text" id="quick-search-input" class="search-input" placeholder="Search by name, phone number, city..." value="${this.escapeHtml(this.state.search)}" />
              ${this.state.search ? `<button type="button" id="clear-search-btn" class="clear-search-x">&times;</button>` : ''}
            </div>

            <!-- Month Filter -->
            <div class="month-filter-wrap">
              <select id="quick-month-select" class="clean-select">
                <option value="ALL" ${this.state.month === 'ALL' ? 'selected' : ''}>📅 All Months</option>
                ${availableMonths.map(m => `
                  <option value="${m.key}" ${this.state.month === m.key ? 'selected' : ''}>
                    📅 ${m.label} (${m.count})
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Course Filter -->
            <div class="course-filter-wrap">
              <select id="quick-course-select" class="clean-select">
                <option value="ALL" ${this.state.course === 'ALL' ? 'selected' : ''}>🎓 All Courses</option>
                ${VALID_COURSES.map(c => `<option value="${c}" ${this.state.course === c ? 'selected' : ''}>${c.split(' ')[0]} ${c.includes('LL.M') ? 'LL.M' : 'LL.B'}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Clickable Status Filter Chips -->
          <div class="status-chips-scroll">
            <button type="button" class="status-chip ${this.state.status === 'ALL' ? 'active' : ''}" data-status="ALL">
              All Enquiries <span class="chip-count">${stats.cards.totalEnquiries}</span>
            </button>
            <button type="button" class="status-chip chip-new ${this.state.status === 'New' ? 'active' : ''}" data-status="New">
              ⚡ New <span class="chip-count">${stats.cards.newEnquiries}</span>
            </button>
            <button type="button" class="status-chip chip-contacted ${this.state.status === 'Contacted' ? 'active' : ''}" data-status="Contacted">
              📞 Contacted <span class="chip-count">${stats.cards.contacted}</span>
            </button>
            <button type="button" class="status-chip chip-followup ${this.state.status === 'Follow-up Required' ? 'active' : ''}" data-status="Follow-up Required">
              ⏳ Follow-up <span class="chip-count">${stats.cards.pendingFollowUps}</span>
            </button>
            <button type="button" class="status-chip chip-admitted ${this.state.status === 'Admission Completed' ? 'active' : ''}" data-status="Admission Completed">
              ✅ Admitted <span class="chip-count">${stats.cards.admissionCompleted}</span>
            </button>
          </div>

          <!-- Total Count Display & Limit Selector -->
          <div class="leads-count-header">
            <div class="leads-count-info">
              <span>Showing <strong>${displayedCount}</strong> of <strong>${isFilteredByOther ? filteredTotal : monthTotalLeads}</strong> enquiries</span>
              ${this.state.month !== 'ALL' ? `<span class="scope-badge">${selectedMonthLabel} (${monthTotalLeads} leads)</span>` : ''}
              ${isFilteredByOther ? `<span class="scope-badge">Filtered</span>` : ''}
            </div>

            <div class="leads-count-controls">
              <!-- Show X leads dropdown (e.g. 10/50 leads) -->
              <div class="limit-selector-row">
                <label for="leads-limit-select" class="limit-lbl">Show:</label>
                <select id="leads-limit-select" class="clean-select clean-select-sm" title="Select number of leads to display">
                  <option value="10" ${this.state.pageSize == 10 ? 'selected' : ''}>10 leads</option>
                  <option value="25" ${this.state.pageSize == 25 ? 'selected' : ''}>25 leads</option>
                  <option value="50" ${this.state.pageSize == 50 ? 'selected' : ''}>50 leads</option>
                  <option value="100" ${this.state.pageSize == 100 ? 'selected' : ''}>100 leads</option>
                  <option value="ALL" ${this.state.pageSize === 'ALL' ? 'selected' : ''}>All leads (${filteredTotal})</option>
                </select>
              </div>

              <!-- Pagination Navigation -->
              ${leadsResult.totalPages > 1 && this.state.pageSize !== 'ALL' ? `
                <div class="pagination-btn-group">
                  <button type="button" class="btn-page-nav" id="btn-prev-page" ${leadsResult.page <= 1 ? 'disabled' : ''} title="Previous Page">‹ Prev</button>
                  <span class="pagination-page-num">${leadsResult.page} / ${leadsResult.totalPages}</span>
                  <button type="button" class="btn-page-nav" id="btn-next-page" ${leadsResult.page >= leadsResult.totalPages ? 'disabled' : ''} title="Next Page">Next ›</button>
                </div>
              ` : ''}

              ${(this.state.search || this.state.course !== 'ALL' || this.state.status !== 'ALL' || this.state.month !== 'ALL' || this.state.pageSize != 10 || this.state.page > 1) ? `<a href="javascript:void(0)" id="reset-all-filters" class="reset-link">Reset filters</a>` : ''}
            </div>
          </div>

          <!-- Leads List -->
          <div class="leads-cards-container" id="leads-container">
            ${leadsResult.data.length === 0 ? `
              <div class="empty-leads-box">
                <p>No enquiries found matching your filter.</p>
                <button type="button" id="empty-reset-btn" class="simple-btn-outline" style="margin-top:10px;">Clear Filters</button>
              </div>
            ` : leadsResult.data.map(lead => this.renderSimpleLeadCard(lead)).join('')}
          </div>
        </main>
      </div>

      <!-- Quick Modal Container for Details & Notes -->
      <div id="quick-modal-backdrop" class="modal-backdrop-wrap" style="display:none;"></div>
    `;

    // Event Handlers
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      AuthService.logout();
      this.showToast('Signed out.', 'info');
      this.navigateTo('/AdminDashboard');
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', async () => {
      try {
        const allFiltered = await LeadService.getLeads({
          search: this.state.search,
          course: this.state.course,
          status: this.state.status,
          month: this.state.month,
          pageSize: 'ALL'
        });
        ExportService.exportLeadsToCSV(allFiltered.data);
        this.showToast(`Exported ${allFiltered.data.length} leads to CSV.`, 'success');
      } catch (e) {
        this.showToast(e.message, 'error');
      }
    });

    // Search input
    let searchTimer;
    const searchInput = document.getElementById('quick-search-input');
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this.state.search = e.target.value.trim();
        this.state.page = 1;
        this.renderMainDashboard();
      }, 200);
    });

    document.getElementById('clear-search-btn')?.addEventListener('click', () => {
      this.state.search = '';
      this.state.page = 1;
      this.renderMainDashboard();
    });

    // Month filter select
    document.getElementById('quick-month-select')?.addEventListener('change', (e) => {
      this.state.month = e.target.value;
      this.state.page = 1;
      this.renderMainDashboard();
    });

    // Course select
    document.getElementById('quick-course-select')?.addEventListener('change', (e) => {
      this.state.course = e.target.value;
      this.state.page = 1;
      this.renderMainDashboard();
    });

    // Status filter chips
    document.querySelectorAll('.status-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.status = btn.getAttribute('data-status');
        this.state.page = 1;
        this.renderMainDashboard();
      });
    });

    // Page size / limit select (e.g. 10/50 leads)
    document.getElementById('leads-limit-select')?.addEventListener('change', (e) => {
      this.state.pageSize = e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value, 10);
      this.state.page = 1;
      this.renderMainDashboard();
    });

    // Pagination navigation buttons
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (this.state.page > 1) {
        this.state.page--;
        this.renderMainDashboard();
      }
    });

    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      if (this.state.page < leadsResult.totalPages) {
        this.state.page++;
        this.renderMainDashboard();
      }
    });

    const resetFilters = () => {
      this.state = {
        search: '',
        course: 'ALL',
        status: 'ALL',
        month: 'ALL',
        pageSize: 10,
        page: 1,
        selectedLeadId: null
      };
      this.renderMainDashboard();
    };

    document.getElementById('reset-all-filters')?.addEventListener('click', resetFilters);
    document.getElementById('empty-reset-btn')?.addEventListener('click', resetFilters);

    // Inline status change on cards
    document.querySelectorAll('.inline-status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const leadId = sel.getAttribute('data-lead-id');
        const newStatus = sel.value;
        const res = await LeadService.updateLeadStatus(leadId, newStatus);
        if (res.success) {
          this.showToast(`Status updated to "${newStatus}"`, 'success');
          this.renderMainDashboard();
        }
      });
    });

    // Open Lead Details Modal
    document.querySelectorAll('.open-details-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const leadId = btn.getAttribute('data-lead-id');
        this.openLeadModal(leadId);
      });
    });
  }

  /**
   * Render individual clean lead card
   */
  renderSimpleLeadCard(lead) {
    const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });

    const waText = encodeURIComponent(`Hello ${lead.name}, greetings from Soarghaati Law College, Pithoragarh! We have received your admission enquiry for ${lead.course}. When would be a good time to speak with our admissions counselor?`);
    const waLink = `https://wa.me/91${lead.mobile}?text=${waText}`;

    const shortCourse = lead.course.includes('5-Year') ? 'B.A. LL.B (5-Yr)' : (lead.course.includes('3-Year') ? 'LL.B (3-Yr)' : 'LL.M (2-Yr)');

    return `
      <div class="simple-lead-card status-border-${this.getStatusKey(lead.status)}">
        <div class="card-top-row">
          <div class="card-student-info">
            <h3 class="student-name">${this.escapeHtml(lead.name)}</h3>
            <span class="course-pill">${shortCourse}</span>
            <span class="location-text">📍 ${this.escapeHtml(lead.city)}${lead.state ? ', ' + this.escapeHtml(lead.state) : ''}</span>
          </div>

          <div class="card-meta">
            <span class="date-text">${formattedDate}</span>
            <span class="lead-id-tag">${lead.id}</span>
          </div>
        </div>

        ${lead.message ? `
          <div class="card-message-snippet">
            "${this.escapeHtml(lead.message)}"
          </div>
        ` : ''}

        <!-- Action Row -->
        <div class="card-actions-row">
          <!-- 1-Click WhatsApp Button -->
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-wa" title="Open WhatsApp Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>WhatsApp</span>
          </a>

          <!-- 1-Click Call Button -->
          <a href="tel:+91${lead.mobile}" class="btn-call" title="Call ${lead.mobile}">
            📞 +91 ${lead.mobile}
          </a>

          <!-- Inline Status Selector -->
          <div class="status-select-wrap">
            <select class="inline-status-select ${this.getStatusKey(lead.status)}" data-lead-id="${lead.id}">
              ${VALID_STATUSES.map(s => `<option value="${s}" ${lead.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>

          <!-- Notes & View Button -->
          <button type="button" class="btn-notes open-details-btn" data-lead-id="${lead.id}">
            📝 Notes ${(lead.notes && lead.notes.length > 0) ? `(${lead.notes.length})` : ''}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Quick Slide-up Modal for Details & Internal Notes
   */
  async openLeadModal(leadId) {
    const lead = await LeadService.getLeadById(leadId);
    if (!lead) return;

    const modalBackdrop = document.getElementById('quick-modal-backdrop');
    if (!modalBackdrop) return;

    modalBackdrop.style.display = 'flex';
    modalBackdrop.innerHTML = `
      <div class="modal-card-simple">
        <div class="modal-header-simple">
          <div>
            <h3 style="font-size:1.15rem; font-weight:700;">${this.escapeHtml(lead.name)}</h3>
            <p style="font-size:0.8rem; color:#64748b;">${lead.id} • ${this.escapeHtml(lead.course)}</p>
          </div>
          <button type="button" id="close-modal-x" class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body-simple">
          <!-- Student Contact Info Grid -->
          <div class="modal-info-grid">
            <div>
              <span class="info-label-mini">Mobile</span>
              <a href="tel:+91${lead.mobile}" style="color:#0284c7; font-weight:600; text-decoration:none;">+91 ${lead.mobile}</a>
            </div>
            <div>
              <span class="info-label-mini">Email</span>
              <span style="font-size:0.84rem;">${this.escapeHtml(lead.email)}</span>
            </div>
            <div>
              <span class="info-label-mini">City & State</span>
              <span style="font-size:0.84rem;">${this.escapeHtml(lead.city)}${lead.state ? ', ' + this.escapeHtml(lead.state) : ''}</span>
            </div>
            <div>
              <span class="info-label-mini">Academic Score</span>
              <span style="font-size:0.84rem;">${this.escapeHtml(lead.academicScore || 'N/A')}</span>
            </div>
          </div>

          <!-- Original Message -->
          <div style="margin-top:14px;">
            <span class="info-label-mini">Student's Message</span>
            <div class="modal-msg-box">
              "${this.escapeHtml(lead.message || 'No additional message.')}"
            </div>
          </div>

          <!-- Internal Notes Section -->
          <div style="margin-top:18px;">
            <span class="info-label-mini">Internal Counselor Notes (${lead.notes ? lead.notes.length : 0})</span>
            
            <div class="notes-simple-list" id="modal-notes-list">
              ${(lead.notes && lead.notes.length > 0) ? lead.notes.map(n => `
                <div class="note-simple-item">
                  <div class="note-meta-row">
                    <strong>${this.escapeHtml(n.author || 'Admin')}</strong>
                    <span style="color:#94a3b8; font-size:0.72rem;">${this.formatRelativeTime(n.createdAt)}</span>
                  </div>
                  <div style="font-size:0.84rem; color:#334155; margin-top:2px;">${this.escapeHtml(n.text)}</div>
                </div>
              `).join('') : '<p style="font-size:0.8rem; color:#94a3b8; font-style:italic;">No notes recorded yet.</p>'}
            </div>

            <!-- Add Note Form -->
            <form id="quick-add-note-form" style="margin-top:12px;">
              <textarea id="quick-note-textarea" class="clean-textarea" placeholder="Add counseling remarks, callback details..." required></textarea>
              <button type="submit" id="save-note-btn" class="simple-btn-primary" style="margin-top:6px; width:auto; padding:7px 14px; font-size:0.8rem;">
                Save Note
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => {
      modalBackdrop.style.display = 'none';
      modalBackdrop.innerHTML = '';
      this.renderMainDashboard();
    };

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });

    document.getElementById('close-modal-x')?.addEventListener('click', closeModal);

    document.getElementById('quick-add-note-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = document.getElementById('quick-note-textarea').value.trim();
      if (!text) return;

      const btn = document.getElementById('save-note-btn');
      btn.disabled = true;
      try {
        const res = await LeadService.addLeadNote(lead.id, text);
        if (res.success) {
          this.showToast('Note added!', 'success');
          this.openLeadModal(leadId); // Refresh modal
        }
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    });
  }

  // ============================================================================
  // VIEW: SETTINGS & SUPABASE MIGRATION SPEC
  // ============================================================================
  renderSettingsView() {
    this.root.innerHTML = `
      <div class="simple-app-shell">
        <header class="simple-navbar">
          <div class="navbar-brand">
            <span class="navbar-crest"><img src="/college-logo.png" alt="Soar Ghaati Law College Logo" style="width:36px; height:36px; object-fit:contain;" /></span>
            <div>
              <h1 class="navbar-title">Admin Settings</h1>
              <span class="navbar-subtitle">Soarghaati Law College</span>
            </div>
          </div>
          <div class="navbar-actions">
            <a href="/AdminDashboard" data-route="/AdminDashboard" class="simple-btn-outline">
              &larr; Back to Enquiries Desk
            </a>
          </div>
        </header>

        <main class="simple-container" style="max-width:760px;">
          <!-- Supabase Status Card -->
          <div class="simple-lead-card" style="padding:20px;">
            <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:8px;">Supabase Integration Status</h3>
            <p style="font-size:0.84rem; color:#475569; line-height:1.5;">
              The frontend data access layer (<code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">services/leadService.js</code>) is decoupled and ready to connect to Supabase PostgreSQL in the next phase.
            </p>
            
            <div style="margin-top:14px; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; font-size:0.82rem;">
              <div><strong>Current Mode:</strong> Local Mock Store (30 sample enquiries active)</div>
              <div style="margin-top:4px;"><strong>Target Schema:</strong> <code style="color:#0284c7;">admission_enquiries</code> table with Row Level Security (RLS)</div>
            </div>

            <div style="margin-top:18px;">
              <button type="button" id="reset-data-btn" class="simple-btn-outline" style="border-color:#d97706; color:#b45309;">
                🔄 Reset Sample Enquiries to Default (30 leads)
              </button>
            </div>
          </div>

          <div style="margin-top:18px; text-align:center;">
            <a href="/AdminDashboard" data-route="/AdminDashboard" class="clean-link">&larr; Return to Enquiries Desk</a>
          </div>
        </main>
      </div>
    `;

    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
      if (confirm('Reset sample records back to initial 30 enquiries?')) {
        LeadService.resetMockData();
        this.showToast('Reset sample enquiries.', 'success');
      }
    });
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================
  getStatusKey(status) {
    if (status === 'New') return 'new';
    if (status === 'Contacted') return 'contacted';
    if (status === 'Follow-up Required') return 'followup';
    if (status === 'Interested') return 'interested';
    if (status === 'Not Interested') return 'not-interested';
    if (status === 'Admission Completed') return 'admitted';
    return 'new';
  }

  formatRelativeTime(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Reliable initialization for ES modules
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AdminApp());
} else {
  new AdminApp();
}
