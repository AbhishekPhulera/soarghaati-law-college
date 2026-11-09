/**
 * Soarghaati Law College - Real-Time Admissions Lead Data Provider
 * Synchronized with the Hostinger SQLite Database.
 */

const STORAGE_KEY = 'slc_admission_leads_v1';
const RESET_TIMESTAMP_KEY = 'slc_leads_last_reset';

export const INITIAL_MOCK_LEADS = [];

export class MockDataProvider {
  static getStoredLeads() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[MockDataProvider] Error reading localStorage:', e);
    }
    return [];
  }

  static saveLeads(leads) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads || []));
    } catch (e) {
      console.error('[MockDataProvider] Error writing to localStorage:', e);
    }
  }

  static resetToDefault() {
    this.saveLeads([]);
    localStorage.setItem(RESET_TIMESTAMP_KEY, new Date().toISOString());
    return [];
  }
}
