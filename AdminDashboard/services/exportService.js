/**
 * ==============================================================================
 * EXPORT SERVICE — Soarghaati Law College Admission Management System
 * ==============================================================================
 * 
 * SECURITY REQUIREMENTS IMPLEMENTED:
 * 1. CSV Formula Injection Defense (OWASP ASVS):
 *    Any field beginning with characters `=, +, -, @, \t, \r` can be executed
 *    as a formula by Microsoft Excel, LibreOffice Calc, or Google Sheets.
 *    All cells are sanitized by prefixing dangerous initiation characters with
 *    a neutral single-quote escape (`'`).
 * 2. Strict Quoting & Delimiter Neutralization:
 *    Properly surrounds entries containing commas, quotes, or newlines in double quotes,
 *    and escapes internal quotes with double double-quotes (`""`).
 * 3. UTF-8 Byte Order Mark (BOM) Inclusion:
 *    Ensures spreadsheet applications accurately interpret UTF-8 characters
 *    (special characters, regional names, rupee symbols).
 * 4. Audit Logging:
 *    Every export event is recorded with record count, filter criteria, and timestamp.
 * ==============================================================================
 */

import { AuditService, AuditAction } from './auditService.js';

export class ExportService {
  /**
   * Sanitize an individual cell value against CSV formula injection
   * @param {any} value 
   * @returns {string}
   */
  static sanitizeCellValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    
    let stringVal = String(value).trim();

    // Check for formula triggers
    const formulaChars = ['=', '+', '-', '@', '\t', '\r'];
    if (formulaChars.some(char => stringVal.startsWith(char))) {
      // Prefix with single quote to force spreadsheet programs to treat as raw text
      stringVal = "'" + stringVal;
    }

    // Escape quotes by doubling them
    stringVal = stringVal.replace(/"/g, '""');

    // If cell contains commas, quotes, or newlines, wrap in quotes
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
      return `"${stringVal}"`;
    }

    return `"${stringVal}"`;
  }

  /**
   * Export an array of leads to a sanitized CSV file
   * @param {Array} leads - Array of lead objects
   * @param {string} customFilename - Desired file name
   * @param {object} filterContext - Contextual filters applied
   */
  static exportLeadsToCSV(leads = [], customFilename = null, filterContext = {}) {
    if (!Array.isArray(leads) || leads.length === 0) {
      throw new Error('No admission lead records available for export.');
    }

    const headers = [
      'Lead ID',
      'Student Name',
      'Mobile Number',
      'Alternative Contact',
      'Email Address',
      'Course Interested In',
      'City',
      'State',
      'Academic Score',
      'Category',
      'Status',
      'Submission Date',
      'Next Follow-Up Date',
      'Original Enquiry Message',
      'Internal Notes Summary'
    ];

    const rows = leads.map(lead => {
      const notesSummary = Array.isArray(lead.notes) 
        ? lead.notes.map(n => `[${n.author || 'Admin'}]: ${n.text}`).join(' | ') 
        : '';

      const formattedDate = lead.createdAt 
        ? new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : '';

      return [
        this.sanitizeCellValue(lead.id),
        this.sanitizeCellValue(lead.name),
        this.sanitizeCellValue(lead.mobile),
        this.sanitizeCellValue(lead.altMobile || 'N/A'),
        this.sanitizeCellValue(lead.email),
        this.sanitizeCellValue(lead.course),
        this.sanitizeCellValue(lead.city),
        this.sanitizeCellValue(lead.state || 'Uttarakhand'),
        this.sanitizeCellValue(lead.academicScore || 'N/A'),
        this.sanitizeCellValue(lead.category || 'General'),
        this.sanitizeCellValue(lead.status),
        this.sanitizeCellValue(formattedDate),
        this.sanitizeCellValue(lead.followUpDate || 'None'),
        this.sanitizeCellValue(lead.message || ''),
        this.sanitizeCellValue(notesSummary)
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(h => `"${h}"`).join(','), ...rows].join('\r\n');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = customFilename || `Soarghaati_Admissions_Leads_${timestamp}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', filename);
    downloadAnchor.style.display = 'none';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    // Record audit event
    AuditService.log(AuditAction.EXPORT_CSV, {
      recordCount: leads.length,
      filename,
      filters: filterContext
    });

    return {
      success: true,
      filename,
      recordCount: leads.length
    };
  }
}
