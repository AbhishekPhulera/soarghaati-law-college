/**
 * ==============================================================================
 * AUDIT SERVICE — Soarghaati Law College Admission Management System
 * ==============================================================================
 * 
 * ARCHITECTURAL NOTICE:
 * Production-level college administration requires strict non-repudiation and
 * audit trails. All lead status mutations, administrative notes, exports, and
 * session logins must produce tamper-evident audit records.
 * 
 * In production with Supabase:
 * - This service will insert into an append-only PostgreSQL table `audit_logs`
 *   with Row Level Security preventing modification or deletion by any client.
 * - Server-side database triggers can also auto-capture `updated_at` and `updated_by`.
 * ==============================================================================
 */

const AUDIT_STORAGE_KEY = 'slc_admission_audit_logs_v1';

export const AuditAction = {
  LOGIN: 'ADMIN_LOGIN',
  LOGOUT: 'ADMIN_LOGOUT',
  VIEW_LEAD: 'VIEW_LEAD_DETAILS',
  STATUS_CHANGE: 'UPDATE_LEAD_STATUS',
  NOTE_ADDED: 'ADD_INTERNAL_NOTE',
  FOLLOWUP_SCHEDULED: 'SCHEDULE_FOLLOWUP',
  EXPORT_CSV: 'EXPORT_LEADS_CSV',
  SETTINGS_UPDATE: 'UPDATE_SETTINGS',
  RESET_MOCK_DATA: 'RESET_MOCK_DATA'
};

export class AuditService {
  /**
   * Log an administrative event
   * @param {string} action - Event type from AuditAction
   * @param {object} details - Metadata describing the action
   * @param {string} targetId - Optional target entity ID (e.g. Lead ID)
   */
  static log(action, details = {}, targetId = null) {
    const actorEmail = localStorage.getItem('slc_admin_user_email') || 'admin@soarghaati.edu.in';
    const actorName = localStorage.getItem('slc_admin_user_name') || 'Admissions Administrator';
    
    const entry = {
      id: 'AUD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      action,
      targetId,
      actor: {
        email: actorEmail,
        name: actorName,
        role: 'Admission Officer'
      },
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      // In production, IP address and session token hash are assigned server-side
      clientIp: '127.0.0.1 (Local Dev Session)'
    };

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      // Keep last 150 entries in mock mode
      const trimmed = logs.slice(0, 150);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('[AuditService] Failed to record audit entry:', e);
    }

    return entry;
  }

  /**
   * Retrieve audit logs
   * @param {number} limit 
   * @returns {Array}
   */
  static getLogs(limit = 50) {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return limit ? parsed.slice(0, limit) : parsed;
        }
      }
    } catch (e) {
      console.warn('[AuditService] Failed to read audit logs:', e);
    }
    return [];
  }

  /**
   * Clear mock audit logs
   */
  static clearLogs() {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}
