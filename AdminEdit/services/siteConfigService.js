/**
 * ==============================================================================
 * SITE CONFIGURATION SERVICE — Soarghaati Law College CMS
 * ==============================================================================
 * Central configuration store for dynamic website parameters:
 * - Courses (Addition, Deletion, Modification, Curriculum Tags, Seats, Badges)
 * - Admission Form (Program dropdown options, States, Labels, Field constraints)
 * - Institutional Contacts (Phone, WhatsApp, Email, Campus Address)
 * - Announcements & Brochure (Top strip message, Academic year, PDF URL)
 * ==============================================================================
 */

export const CONFIG_STORAGE_KEY = 'slc_site_config_v1';
export const CONFIG_LAST_SAVED_KEY = 'slc_config_last_saved';
export const CONFIG_HISTORY_KEY = 'slc_config_audit_history';

export const DEFAULT_SITE_CONFIG = {
  institution: {
    name: "Soarghaati Law College",
    tagline: "First Law College of Pithoragarh District, Uttarakhand",
    academicYear: "2026–27",
    brochureUrl: "/Soarghaati_Law_College_Brochure_2026.pdf",
    phonePrimary: "+91 7830201028",
    phoneDisplay: "+91 7830201028",
    whatsappNumber: "917830201028",
    email: "info@sglawcollege.com",
    address: "Soarghaati Law College, Pithoragarh District, Uttarakhand - 262501, India",
    topAnnouncement: "ADMISSIONS 2026–27 OPEN: Direct Merit Admissions Open for B.A. LL.B (5-Year), LL.B (3-Year) & LL.M"
  },
  formConfig: {
    heading: "Admission and Brochure",
    subheading: "Fill out your details below to download the official prospectus and connect with our admissions desk.",
    submitBtnText: "Proceed",
    programOptions: [
      { id: "ba-llb-5yr", value: "B.A. LL.B (5-Year)", label: "B.A. LL.B (5-Year Integrated Course - After 10+2)" },
      { id: "llb-3yr", value: "LL.B (3-Year)", label: "LL.B (3-Year Professional Course - After Graduation)" },
      { id: "llm-2yr", value: "LL.M (Postgraduate)", label: "LL.M (Postgraduate Master of Laws - After LL.B)" }
    ],
    stateOptions: [
      "Uttarakhand", "Uttar Pradesh", "Delhi NCR", "Bihar", "Haryana", "Punjab",
      "Himachal Pradesh", "Rajasthan", "Madhya Pradesh", "Chandigarh", "West Bengal",
      "Maharashtra", "Gujarat", "Jharkhand", "Assam", "Odisha", "Jammu & Kashmir", "Other State"
    ],
    fields: {
      nameRequired: true,
      mobileRequired: true,
      emailRequired: false,
      programRequired: true,
      qualificationRequired: true,
      stateRequired: true,
      cityRequired: true
    }
  },
  courses: [
    {
      id: "ba-llb-5yr",
      code: "B.A. LL.B",
      degreeBadge: "5 YEARS INTEGRATED",
      badgeColor: "gold",
      eligibilityCode: "ELIGIBILITY: 10+2 (ANY STREAM)",
      title: "B.A. LL.B (Honours)",
      subtitle: "Bachelor of Arts & Bachelor of Laws • Integrated Undergraduate Degree",
      description: "The premier five-year double-degree programme designed for students immediately after completing Class 12. Integrates political philosophy, sociology, and economics with rigorous constitutional, criminal, and commercial jurisprudence.",
      duration: "5 Academic Years (10 Semesters)",
      affiliation: "SSJ University, Almora",
      approval: "Bar Council of India (BCI)",
      annualSeats: "60 Seats",
      isFeatured: false,
      featuredLabel: "",
      icon: "⚖️",
      heroDesc: "5-Year Integrated Course (After 10+2)",
      curriculumTags: [
        "Constitutional Law of India",
        "Law of Torts & Consumer Protection",
        "Indian Penal Code & Criminal Justice",
        "Law of Contracts & Corporate Law",
        "Appellate Advocacy & Drafting",
        "Cyber & Intellectual Property Rights"
      ]
    },
    {
      id: "llb-3yr",
      code: "LL.B",
      degreeBadge: "3 YEARS GRADUATE",
      badgeColor: "blue",
      eligibilityCode: "ELIGIBILITY: GRADUATION IN ANY STREAM",
      title: "LL.B (Professional)",
      subtitle: "Bachelor of Laws • Graduate Professional Degree",
      description: "The classic graduate route into legal practice, catering to degree holders from arts, science, commerce, and engineering backgrounds seeking full Bar Council eligibility.",
      duration: "3 Academic Years (6 Semesters)",
      affiliation: "SSJ University, Almora",
      approval: "Bar Council of India (BCI)",
      annualSeats: "120 Seats",
      isFeatured: true,
      featuredLabel: "MOST POPULAR",
      icon: "📖",
      heroDesc: "3-Year Professional Course (After Degree)",
      curriculumTags: [
        "Civil Procedure Code (CPC) & Limitation",
        "Code of Criminal Procedure (CrPC)",
        "Indian Evidence Act & Trial Advocacy",
        "Company Law & Competition Jurisprudence",
        "Administrative & Labour Law",
        "Professional Ethics & Bar-Bench Relations"
      ]
    },
    {
      id: "llm-2yr",
      code: "LL.M",
      degreeBadge: "2 YEARS POSTGRADUATE",
      badgeColor: "gold",
      eligibilityCode: "ELIGIBILITY: LL.B DEGREE WITH MIN 50%",
      title: "LL.M (Master of Laws)",
      subtitle: "Postgraduate Degree in Advanced Jurisprudence & Research",
      description: "Rigorous scholarly program focused on high-level legal research, advanced constitutional thought, comparative public law, and judicial service preparation.",
      duration: "2 Academic Years (4 Semesters)",
      affiliation: "SSJ University, Almora",
      approval: "Bar Council of India (BCI)",
      annualSeats: "30 Seats",
      isFeatured: false,
      featuredLabel: "",
      icon: "🏛️",
      heroDesc: "Master of Laws (Postgraduate Specialisation)",
      curriculumTags: [
        "Advanced Constitutional Jurisprudence",
        "Judicial Process & Judicial Review",
        "Comparative Public Law Systems",
        "Legal Research Methodology & Thesis",
        "Human Rights & Environmental Law",
        "International Trade & Commercial Dispute"
      ]
    }
  ],
  faculty: [
    {
      id: "fac-1",
      name: "Mr. Satish Chand Upadhyay",
      designation: "Principal",
      department: "Law Faculty",
      qualification: "LL.M, NET, Ph.D in Law",
      subject: "Jurisprudence & Legal Studies",
      category: "law",
      photo: ""
    },
    {
      id: "fac-2",
      name: "Mr. Mukul Chitransh",
      designation: "Assistant Professor",
      department: "Law Faculty",
      qualification: "LL.M, NET",
      subject: "Constitutional Law",
      category: "law",
      photo: ""
    },
    {
      id: "fac-3",
      name: "Mr. Siraj",
      designation: "Assistant Professor",
      department: "Law Faculty",
      qualification: "LL.M, NET",
      subject: "Law Of Contract",
      category: "law",
      photo: ""
    },
    {
      id: "fac-4",
      name: "Mr. Sandeep Kumar Yadav",
      designation: "Assistant Professor",
      department: "Law Faculty",
      qualification: "LL.M, NET",
      subject: "Jurisprudence",
      category: "law",
      photo: ""
    },
    {
      id: "fac-5",
      name: "Mr. Sobhit Chaudhari",
      designation: "Assistant Professor",
      department: "Law Faculty",
      qualification: "LL.M, NET",
      subject: "Hindu Law",
      category: "law",
      photo: ""
    },
    {
      id: "fac-6",
      name: "Mr. Himanshu Mehta",
      designation: "Assistant Professor",
      department: "Law Faculty",
      qualification: "LL.B",
      subject: "Legal Aid Clinic",
      category: "law",
      photo: ""
    },
    {
      id: "fac-7",
      name: "Dr. Devender Singh",
      designation: "Assistant Professor",
      department: "Department of Humanities",
      qualification: "M.A., Ph.D in History",
      subject: "History",
      category: "humanities",
      photo: ""
    },
    {
      id: "fac-8",
      name: "Dr. Surendra Singh Rana",
      designation: "Assistant Professor",
      department: "Department of Humanities",
      qualification: "M.A., Ph.D in Political Science",
      subject: "Political Science",
      category: "humanities",
      photo: ""
    },
    {
      id: "fac-9",
      name: "Mr. Ankur Pant",
      designation: "Assistant Professor",
      department: "Department of Humanities",
      qualification: "M.A., NET in Sociology",
      subject: "Sociology",
      category: "humanities",
      photo: ""
    },
    {
      id: "fac-10",
      name: "Mr. Akhatar Ali",
      designation: "Librarian",
      department: "Law Library & Documentation",
      qualification: "M. Lib",
      subject: "Library & Information Science",
      category: "library",
      photo: ""
    },
    {
      id: "fac-11",
      name: "Miss Kanchan Kanyal",
      designation: "Administrative Staff",
      department: "Administration",
      qualification: "M.A",
      subject: "College Administration & Student Records",
      category: "admin",
      photo: ""
    },
    {
      id: "fac-12",
      name: "Mr. Pramod Kumar Kohli",
      designation: "Office Staff-I",
      department: "Administration",
      qualification: "MBA",
      subject: "Academic Operations & Management",
      category: "admin",
      photo: ""
    },
    {
      id: "fac-13",
      name: "Miss Soniya Tamta",
      designation: "Office Staff",
      department: "Administration",
      qualification: "B.Tech",
      subject: "IT Systems & Institutional Data",
      category: "admin",
      photo: ""
    },
    {
      id: "fac-14",
      name: "Mr. Apurv Raj",
      designation: "Class III Staff",
      department: "Administration & Facilities",
      qualification: "12th",
      subject: "Office Support & Coordination",
      category: "support",
      photo: ""
    },
    {
      id: "fac-15",
      name: "Mr. Kheem Prasad",
      designation: "Support Staff (Peon)",
      department: "Campus Services",
      qualification: "Matriculation",
      subject: "Campus Support & Logistics",
      category: "support",
      photo: ""
    },
    {
      id: "fac-16",
      name: "Smt. Seeta Devi",
      designation: "Support Staff (Peon)",
      department: "Campus Services",
      qualification: "Matriculation",
      subject: "Campus Support & Hospitality",
      category: "support",
      photo: ""
    }
  ]
};

export class SiteConfigService {
  /**
   * Safe recursive merger to ensure all default fields exist
   */
  static mergeWithDefaults(parsed = {}) {
    if (!parsed || typeof parsed !== 'object') {
      return JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
    }
    return {
      ...DEFAULT_SITE_CONFIG,
      ...parsed,
      institution: {
        ...DEFAULT_SITE_CONFIG.institution,
        ...(parsed.institution || {})
      },
      formConfig: {
        ...DEFAULT_SITE_CONFIG.formConfig,
        ...(parsed.formConfig || {}),
        programOptions: Array.isArray(parsed.formConfig?.programOptions)
          ? parsed.formConfig.programOptions
          : DEFAULT_SITE_CONFIG.formConfig.programOptions,
        stateOptions: Array.isArray(parsed.formConfig?.stateOptions)
          ? parsed.formConfig.stateOptions
          : DEFAULT_SITE_CONFIG.formConfig.stateOptions,
        fields: {
          ...DEFAULT_SITE_CONFIG.formConfig.fields,
          ...(parsed.formConfig?.fields || {})
        }
      },
      courses: Array.isArray(parsed.courses)
        ? parsed.courses
        : DEFAULT_SITE_CONFIG.courses,
      faculty: Array.isArray(parsed.faculty)
        ? parsed.faculty
        : DEFAULT_SITE_CONFIG.faculty
    };
  }

  /**
   * Load the current configuration synchronously from localStorage, or return default
   * @returns {typeof DEFAULT_SITE_CONFIG}
   */
  static getConfig() {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return this.mergeWithDefaults(parsed);
        }
      }
    } catch (e) {
      console.warn('[SiteConfigService] Failed to read config from storage, using defaults:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
  }

  /**
   * Asynchronously initialize and hydrate config from server / disk (public/site-config.json)
   * This guarantees that edits saved in AdminEdit are loaded across browsers, devices, and code changes.
   * @returns {Promise<typeof DEFAULT_SITE_CONFIG>}
   */
  static async initConfig() {
    try {
      const timestamp = Date.now();
      // 1. Try reading from active persistence API with cache-buster
      let res = await fetch(`/api/site-config?_t=${timestamp}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
      }).catch(() => null);

      // 2. If API is not responding, fallback to static /site-config.json with cache-buster
      if (!res || !res.ok) {
        res = await fetch(`/site-config.json?_t=${timestamp}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' }
        }).catch(() => null);
      }

      if (res && res.ok) {
        const diskConfig = await res.json();
        if (diskConfig && typeof diskConfig === 'object') {
          const merged = this.mergeWithDefaults(diskConfig);
          // Update client cache in localStorage
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
          // Notify listeners that disk configuration has arrived
          window.dispatchEvent(new CustomEvent('slc_site_config_updated', { detail: merged }));
          return merged;
        }
      }
    } catch (e) {
      console.warn('[SiteConfigService] Could not hydrate from disk config:', e);
    }
    return this.getConfig();
  }

  /**
   * Save configuration to localStorage and permanently reserve it on disk via server API
   * @param {object} newConfig 
   * @param {string} actionDesc 
   * @param {string} author 
   * @returns {Promise<boolean>}
   */
  static async saveConfig(newConfig, actionDesc = 'Updated website configuration', author = 'Admin Editor') {
    try {
      const merged = this.mergeWithDefaults(newConfig);

      // 1. Save to localStorage immediately for instant client responsiveness
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
      const now = new Date().toISOString();
      localStorage.setItem(CONFIG_LAST_SAVED_KEY, now);

      // 2. Record audit history entry
      const history = this.getAuditHistory();
      history.unshift({
        id: 'CFG-' + Date.now().toString(36).toUpperCase(),
        timestamp: now,
        author,
        action: actionDesc
      });
      localStorage.setItem(CONFIG_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));

      // 3. Trigger custom storage event for same-window updates
      window.dispatchEvent(new CustomEvent('slc_site_config_updated', { detail: merged }));

      // 4. Reserve & Persist directly to disk on server
      try {
        const apiRes = await fetch('/api/site-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(merged)
        });
        if (!apiRes.ok) {
          console.warn('[SiteConfigService] Server disk sync responded with status:', apiRes.status);
        }
      } catch (networkErr) {
        console.warn('[SiteConfigService] Disk sync network error (saved locally):', networkErr);
      }

      return true;
    } catch (e) {
      console.error('[SiteConfigService] Error saving config:', e);
      return false;
    }
  }

  /**
   * Reset configuration back to factory default
   */
  static async resetToDefaults(author = 'Admin Editor') {
    const config = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG));
    await this.saveConfig(config, 'Reset entire website configuration to factory defaults', author);
    return config;
  }

  /**
   * Retrieve audit history of configuration changes
   */
  static getAuditHistory() {
    try {
      const raw = localStorage.getItem(CONFIG_HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('[SiteConfigService] Error reading audit history:', e);
    }
    return [];
  }

  /**
   * Export config as downloadable JSON string
   */
  static exportConfigJson() {
    return JSON.stringify(this.getConfig(), null, 2);
  }

  /**
   * Import config from JSON string
   */
  static async importConfigJson(jsonStr, author = 'Admin Editor') {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format');
      }
      if (!parsed.institution || !parsed.courses || !Array.isArray(parsed.courses)) {
        throw new Error('Configuration structure is missing required properties');
      }
      const merged = this.mergeWithDefaults(parsed);
      await this.saveConfig(merged, 'Imported website configuration from backup file', author);
      return { success: true, config: merged };
    } catch (e) {
      return { success: false, error: e.message || 'Failed to parse configuration' };
    }
  }
}
