/**
 * ==============================================================================
 * LEAD SERVICE — Soarghaati Law College Admission Management System
 * ==============================================================================
 * 
 * ARCHITECTURAL NOTICE:
 * This is the centralized data-access layer for student enquiries and admission leads.
 * In the current phase, it communicates with `MockDataProvider`.
 * 
 * When Supabase is integrated:
 * - Each method here will be swapped to query the Supabase client:
 *   e.g. `supabase.from('admission_enquiries').select('*')...`
 * - Database-level Row Level Security (RLS) policies will enforce that:
 *   1. Anonymous/public visitors can ONLY INSERT new enquiries (cannot SELECT or UPDATE).
 *   2. Authenticated admission officers can SELECT and UPDATE based on their RBAC role.
 *   3. Secret service-role keys are kept strictly on the backend/serverless functions.
 * ==============================================================================
 */

import { MockDataProvider } from './mockDataProvider.js';
import { AuditService, AuditAction } from './auditService.js';

export const VALID_STATUSES = [
  'New',
  'Contacted',
  'Follow-up Required',
  'Interested',
  'Not Interested',
  'Admission Completed'
];

export const VALID_COURSES = [
  'B.A. LL.B (5-Year Integrated)',
  'LL.B (3-Year Degree)',
  'LL.M (2-Year Master of Laws)'
];

export class LeadService {
  /**
   * Fetch leads with full search, filtering, sorting, and pagination
   * @param {object} params
   * @returns {Promise<{data: Array, total: number, page: number, pageSize: number, totalPages: number}>}
   */
  static async getLeads({
    search = '',
    course = 'ALL',
    status = 'ALL',
    month = 'ALL',
    dateRange = 'all',
    startDate = null,
    endDate = null,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10
  } = {}) {
    // 0. Sync real leads directly from Hostinger SQLite Server Database
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const serverLeads = json.data.map(r => ({
            id: r.id,
            name: r.studentName || r.name,
            mobile: r.mobile || r.phone,
            email: r.email || `${(r.studentName || r.name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`,
            altMobile: '',
            course: r.course || r.program,
            city: r.city || 'Pithoragarh',
            state: r.state || 'Uttarakhand',
            academicScore: r.percentage || r.qualification || 'N/A',
            category: 'General',
            createdAt: r.createdAt || new Date().toISOString(),
            status: r.status || 'New',
            followUpDate: null,
            message: `Online enquiry via website for ${r.course || 'Admissions'}. Qualification: ${r.percentage || 'N/A'}. Location: ${r.city || 'Pithoragarh'}, ${r.state || 'Uttarakhand'}.`,
            notes: r.notes ? [{ id: 'n-1', author: 'Administrator', text: r.notes, createdAt: r.updatedAt || r.createdAt }] : [],
            history: [{ timestamp: r.createdAt || new Date().toISOString(), action: 'Online Enquiry Received', details: `Registered for ${r.course || 'Law Programme'}`, performedBy: 'Website Visitor' }]
          }));

          const localLeads = MockDataProvider.getStoredLeads();
          const serverIds = new Set(serverLeads.map(l => l.id.toLowerCase()));
          const combined = [...serverLeads, ...localLeads.filter(l => !serverIds.has(l.id.toLowerCase()))];
          MockDataProvider.saveLeads(combined);
        }
      }
    } catch (e) {
      console.warn('[LeadService] Could not reach /api/leads, using local storage:', e);
    }

    // Simulate brief asynchronous network delay (80ms)
    await new Promise(resolve => setTimeout(resolve, 80));

    let leads = [...MockDataProvider.getStoredLeads()];

    // 1. Search filter: Name, Email, Mobile, City, ID
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(l => 
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.mobile && l.mobile.includes(q)) ||
        (l.altMobile && l.altMobile.includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q)) ||
        (l.id && l.id.toLowerCase().includes(q))
      );
    }

    // 2. Month filter (e.g. '2026-10' or '2026-09')
    if (month && month !== 'ALL') {
      leads = leads.filter(l => {
        if (!l.createdAt) return false;
        const d = new Date(l.createdAt);
        if (isNaN(d.getTime())) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === month;
      });
    }

    // 3. Course filter
    if (course && course !== 'ALL') {
      leads = leads.filter(l => l.course === course);
    }

    // 4. Status filter
    if (status && status !== 'ALL') {
      leads = leads.filter(l => l.status === status);
    }

    // 5. Date filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      leads = leads.filter(l => {
        if (!l.createdAt) return false;
        const leadDate = new Date(l.createdAt);

        if (dateRange === 'today') {
          return leadDate.toDateString() === now.toDateString();
        } else if (dateRange === 'last7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return leadDate >= sevenDaysAgo;
        } else if (dateRange === 'last30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return leadDate >= thirtyDaysAgo;
        } else if (dateRange === 'custom' && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return leadDate >= start && leadDate <= end;
        }
        return true;
      });
    }

    // 6. Sorting
    leads.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = leads.length;
    const isAll = pageSize === 'ALL' || pageSize >= 9999;
    const effectivePageSize = isAll ? Math.max(1, total) : Math.max(1, parseInt(pageSize, 10) || 10);
    const totalPages = isAll ? 1 : Math.max(1, Math.ceil(total / effectivePageSize));
    const currentPage = isAll ? 1 : Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
    const startIdx = (currentPage - 1) * effectivePageSize;
    const pagedData = isAll ? leads : leads.slice(startIdx, startIdx + effectivePageSize);

    return {
      data: pagedData,
      total,
      page: currentPage,
      pageSize: isAll ? total : effectivePageSize,
      totalPages
    };
  }

  /**
   * Retrieve a single lead by its unique ID
   * @param {string} id 
   * @returns {Promise<object|null>}
   */
  static async getLeadById(id) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const leads = MockDataProvider.getStoredLeads();
    const found = leads.find(l => l.id.toLowerCase() === (id || '').toLowerCase());
    
    if (found) {
      AuditService.log(AuditAction.VIEW_LEAD, {
        leadId: found.id,
        studentName: found.name,
        course: found.course
      }, found.id);
    }
    
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  /**
   * Update the status of an existing lead
   * @param {string} id 
   * @param {string} newStatus 
   * @param {string} reasonOrNote 
   * @returns {Promise<{success: boolean, lead?: object, error?: string}>}
   */
  static async updateLeadStatus(id, newStatus, reasonOrNote = '') {
    if (!VALID_STATUSES.includes(newStatus)) {
      return { success: false, error: `Invalid status: ${newStatus}` };
    }

    const leads = MockDataProvider.getStoredLeads();
    const leadIndex = leads.findIndex(l => l.id.toLowerCase() === id.toLowerCase());

    if (leadIndex === -1) {
      return { success: false, error: 'Lead not found' };
    }

    const targetLead = leads[leadIndex];
    const previousStatus = targetLead.status;
    targetLead.status = newStatus;

    const actor = localStorage.getItem('slc_admin_user_name') || 'Admissions Desk';
    const timestamp = new Date().toISOString();

    // Append to lead history
    if (!Array.isArray(targetLead.history)) targetLead.history = [];
    targetLead.history.unshift({
      timestamp,
      action: 'Status Updated',
      details: `Status transitioned from "${previousStatus}" to "${newStatus}"${reasonOrNote ? ` — Note: ${reasonOrNote}` : ''}`,
      performedBy: actor
    });

    // If a note was attached with the status change, add to notes
    if (reasonOrNote && reasonOrNote.trim()) {
      if (!Array.isArray(targetLead.notes)) targetLead.notes = [];
      targetLead.notes.unshift({
        id: 'note-' + Date.now().toString(36),
        author: actor,
        text: `[Status Change to ${newStatus}]: ${reasonOrNote.trim()}`,
        createdAt: timestamp
      });
    }

    leads[leadIndex] = targetLead;
    MockDataProvider.saveLeads(leads);

    // Sync status change to Hostinger Server Database
    try {
      fetch('/api/leads?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetLead.id, status: newStatus, notes: reasonOrNote || '' })
      }).catch(err => console.warn('Could not sync status to server:', err));
    } catch (e) {}

    // Record audit event
    AuditService.log(AuditAction.STATUS_CHANGE, {
      leadId: targetLead.id,
      studentName: targetLead.name,
      previousStatus,
      newStatus,
      reason: reasonOrNote
    }, targetLead.id);

    return {
      success: true,
      lead: targetLead
    };
  }

  /**
   * Append an internal administrative note to a lead
   * @param {string} id 
   * @param {string} noteText 
   * @param {string} author 
   * @returns {Promise<{success: boolean, note?: object, error?: string}>}
   */
  static async addLeadNote(id, noteText, author = null) {
    if (!noteText || !noteText.trim()) {
      return { success: false, error: 'Note text cannot be empty' };
    }

    const leads = MockDataProvider.getStoredLeads();
    const leadIndex = leads.findIndex(l => l.id.toLowerCase() === id.toLowerCase());

    if (leadIndex === -1) {
      return { success: false, error: 'Lead not found' };
    }

    const targetLead = leads[leadIndex];
    const noteAuthor = author || localStorage.getItem('slc_admin_user_name') || 'Admissions Counselor';
    const timestamp = new Date().toISOString();

    const newNote = {
      id: 'note-' + Date.now().toString(36),
      author: noteAuthor,
      text: noteText.trim(),
      createdAt: timestamp
    };

    if (!Array.isArray(targetLead.notes)) targetLead.notes = [];
    targetLead.notes.unshift(newNote);

    if (!Array.isArray(targetLead.history)) targetLead.history = [];
    targetLead.history.unshift({
      timestamp,
      action: 'Note Added',
      details: `Internal note added by ${noteAuthor}`,
      performedBy: noteAuthor
    });

    leads[leadIndex] = targetLead;
    MockDataProvider.saveLeads(leads);

    // Sync note to Hostinger Server Database
    try {
      fetch('/api/leads?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetLead.id, notes: noteText.trim() })
      }).catch(err => console.warn('Could not sync note to server:', err));
    } catch (e) {}

    AuditService.log(AuditAction.NOTE_ADDED, {
      leadId: targetLead.id,
      studentName: targetLead.name,
      author: noteAuthor,
      noteLength: noteText.length
    }, targetLead.id);

    return {
      success: true,
      note: newNote,
      lead: targetLead
    };
  }

  /**
   * Schedule or update a follow-up date for a lead
   * @param {string} id 
   * @param {string} followUpDate - ISO date string (YYYY-MM-DD)
   * @param {string} notes 
   * @returns {Promise<{success: boolean, lead?: object, error?: string}>}
   */
  static async scheduleFollowUp(id, followUpDate, notes = '') {
    const leads = MockDataProvider.getStoredLeads();
    const leadIndex = leads.findIndex(l => l.id.toLowerCase() === id.toLowerCase());

    if (leadIndex === -1) {
      return { success: false, error: 'Lead not found' };
    }

    const targetLead = leads[leadIndex];
    targetLead.followUpDate = followUpDate || null;
    
    // Automatically transition to Follow-up Required if currently New or Contacted
    if (followUpDate && (targetLead.status === 'New' || targetLead.status === 'Contacted')) {
      targetLead.status = 'Follow-up Required';
    }

    const actor = localStorage.getItem('slc_admin_user_name') || 'Admissions Counselor';
    const timestamp = new Date().toISOString();

    if (!Array.isArray(targetLead.history)) targetLead.history = [];
    targetLead.history.unshift({
      timestamp,
      action: 'Follow-up Scheduled',
      details: `Scheduled follow-up for ${followUpDate}${notes ? ` (Reason: ${notes})` : ''}`,
      performedBy: actor
    });

    if (notes && notes.trim()) {
      if (!Array.isArray(targetLead.notes)) targetLead.notes = [];
      targetLead.notes.unshift({
        id: 'note-' + Date.now().toString(36),
        author: actor,
        text: `[Follow-up for ${followUpDate}]: ${notes.trim()}`,
        createdAt: timestamp
      });
    }

    leads[leadIndex] = targetLead;
    MockDataProvider.saveLeads(leads);

    AuditService.log(AuditAction.FOLLOWUP_SCHEDULED, {
      leadId: targetLead.id,
      followUpDate,
      notes
    }, targetLead.id);

    return {
      success: true,
      lead: targetLead
    };
  }

  /**
   * Aggregate statistics for dashboard summary cards, distributions, and charts
   * Generated dynamically from data layer, NOT hardcoded in UI.
   * Can be scoped to a specific month or 'ALL'
   * @param {string} month e.g. '2026-10' or 'ALL'
   * @returns {Promise<object>}
   */
  static async getDashboardStats(month = 'ALL') {
    await new Promise(resolve => setTimeout(resolve, 80));
    let leads = MockDataProvider.getStoredLeads();

    if (month && month !== 'ALL') {
      leads = leads.filter(l => {
        if (!l.createdAt) return false;
        const d = new Date(l.createdAt);
        if (isNaN(d.getTime())) return false;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === month;
      });
    }

    const totalEnquiries = leads.length;
    const newEnquiries = leads.filter(l => l.status === 'New').length;
    const contacted = leads.filter(l => l.status === 'Contacted').length;
    const pendingFollowUps = leads.filter(l => l.status === 'Follow-up Required').length;
    const admissionCompleted = leads.filter(l => l.status === 'Admission Completed').length;
    const interested = leads.filter(l => l.status === 'Interested').length;
    const notInterested = leads.filter(l => l.status === 'Not Interested').length;

    // Course-wise distribution
    const courseDistribution = {};
    VALID_COURSES.forEach(c => courseDistribution[c] = 0);
    leads.forEach(l => {
      if (courseDistribution[l.course] !== undefined) {
        courseDistribution[l.course]++;
      } else {
        courseDistribution[l.course] = 1;
      }
    });

    // Monthly enquiry statistics (2026 progression)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = {};
    monthNames.forEach(m => monthlyStats[m] = 0);
    
    leads.forEach(l => {
      if (l.createdAt) {
        const d = new Date(l.createdAt);
        const m = monthNames[d.getMonth()];
        if (monthlyStats[m] !== undefined) monthlyStats[m]++;
      }
    });

    // Recent 6 enquiries
    const recentEnquiries = [...leads]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    // Conversion rate
    const conversionRate = totalEnquiries > 0 
      ? ((admissionCompleted / totalEnquiries) * 100).toFixed(1)
      : '0.0';

    return {
      cards: {
        totalEnquiries,
        newEnquiries,
        contacted,
        pendingFollowUps,
        admissionCompleted,
        interested,
        notInterested
      },
      conversionRate,
      courseDistribution,
      monthlyStats,
      recentEnquiries
    };
  }

  /**
   * Get list of unique available months from the stored leads
   * @returns {Array<{key: string, label: string, count: number}>}
   */
  static getAvailableMonths() {
    const leads = MockDataProvider.getStoredLeads();
    const monthsMap = new Map();

    leads.forEach(l => {
      if (l.createdAt) {
        const d = new Date(l.createdAt);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          if (!monthsMap.has(key)) {
            monthsMap.set(key, { key, label, count: 1 });
          } else {
            monthsMap.get(key).count++;
          }
        }
      }
    });

    // Ensure current month is present
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!monthsMap.has(currentKey)) {
      monthsMap.set(currentKey, {
        key: currentKey,
        label: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        count: 0
      });
    }

    return Array.from(monthsMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }

  /**
   * Reset mock data to original 30 baseline records
   */
  static resetMockData() {
    MockDataProvider.resetToDefault();
    AuditService.log(AuditAction.RESET_MOCK_DATA, {
      message: 'Reset mock store to baseline 30 admissions enquiry records'
    });
  }
}
