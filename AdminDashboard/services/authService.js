/**
 * ==============================================================================
 * AUTHENTICATION SERVICE — Soarghaati Law College Admission Management System
 * ==============================================================================
 * 
 * CRITICAL SECURITY ARCHITECTURE NOTICE:
 * ------------------------------------------------------------------------------
 * THIS IMPLEMENTATION IS A FRONTEND DEVELOPMENT PLACEHOLDER.
 * 
 * 1. REAL PRODUCTION SECURITY CANNOT AND MUST NOT EXIST IN BROWSER JAVASCRIPT ALONE.
 *    Any frontend check (e.g., localStorage, React state, or route guards) can be
 *    bypassed by a client with browser developer tools or direct HTTP requests.
 * 
 * 2. PRODUCTION IMPLEMENTATION WITH SUPABASE:
 *    When Supabase is connected in the next phase, this service will be replaced
 *    by official Supabase Auth calls:
 * 
 *      const { data, error } = await supabase.auth.signInWithPassword({
 *        email,
 *        password,
 *      });
 * 
 *    - All backend API endpoints and PostgreSQL queries MUST enforce Row Level
 *      Security (RLS) using `auth.uid()` and verified JWT tokens.
 *    - Service-role secret keys MUST NEVER be exposed in frontend code.
 *    - Multi-Factor Authentication (MFA/TOTP) and rate limiting must be enabled
 *      on the Supabase Auth server.
 * 
 * 3. NO PASSWORDS ARE STORED IN CODE OR PERSISTED IN PLAINTEXT.
 * ==============================================================================
 */

import { AuditService, AuditAction } from './auditService.js';

const SESSION_KEY = 'slc_admin_session_token';
const USER_KEY = 'slc_admin_user_profile';
const SESSION_EXPIRY_KEY = 'slc_admin_session_expiry';

// Simulated development test accounts (for interface prototyping only)
// Production will authenticate solely against Supabase auth.users
export const DEV_ALLOWED_DOMAINS = ['soarghaati.edu.in', 'veg.org.in'];

export class AuthService {
  /**
   * Explanatory security notice for UI display and developer awareness
   */
  static getSecurityNotice() {
    return {
      status: 'DEVELOPMENT_SIMULATION',
      isProductionSecure: false,
      message: 'Frontend mock authentication active. Real production security will be enforced at the database and server layer via Supabase Auth + RLS policies.'
    };
  }

  /**
   * Check if a development session is active and not expired
   * @returns {boolean}
   */
  static isAuthenticated() {
    try {
      const token = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY) || localStorage.getItem(SESSION_EXPIRY_KEY);

      if (!token) return false;
      if (expiry && parseInt(expiry, 10) < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get the currently logged-in admin user profile
   * @returns {object|null}
   */
  static getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Authenticate admin user (Development Placeholder)
   * Validates institutional email structure and simulates server challenge.
   * In Supabase, this delegates to supabase.auth.signInWithPassword.
   * 
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} rememberMe 
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  static async login(email, password, rememberMe = false) {
    // Simulate network latency (400ms - 800ms) for realistic UX and loading states
    await new Promise(resolve => setTimeout(resolve, 600));

    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!trimmedEmail || !cleanPassword) {
      return {
        success: false,
        error: 'Please enter both institutional email address and administrative password.'
      };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        success: false,
        error: 'Please enter a valid administrative email format (e.g., admin@soarghaati.edu.in).'
      };
    }

    // Development phase check: Accept valid admin pattern
    // (Note: Production Supabase will verify password hash via bcrypt/Argon2 server-side)
    if (cleanPassword.length < 6) {
      return {
        success: false,
        error: 'Invalid administrative credentials. Password must be at least 6 characters.'
      };
    }

    // Simulate mock user profile
    const user = {
      id: 'usr_slc_adm_01',
      email: trimmedEmail,
      name: trimmedEmail.includes('admin') ? 'Senior Admissions Administrator' : 'Admissions Officer',
      role: 'Super Admin',
      department: 'Directorate of Admissions & Legal Outreach',
      institution: 'Soarghaati Law College, Pithoragarh',
      lastLogin: new Date().toISOString()
    };

    // Calculate session expiry: 4 hours for session, 7 days for rememberMe
    const durationMs = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000;
    const expiryTimestamp = Date.now() + durationMs;
    const mockToken = 'slc_dev_jwt_' + Math.random().toString(36).substring(2) + '.' + Date.now();

    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Clear opposite storage
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);

    storage.setItem(SESSION_KEY, mockToken);
    storage.setItem(USER_KEY, JSON.stringify(user));
    storage.setItem(SESSION_EXPIRY_KEY, expiryTimestamp.toString());
    
    // Set for audit logging actor
    localStorage.setItem('slc_admin_user_email', user.email);
    localStorage.setItem('slc_admin_user_name', user.name);

    AuditService.log(AuditAction.LOGIN, {
      email: user.email,
      role: user.role,
      rememberMe,
      mode: 'FRONTEND_MOCK_AUTH_SIMULATION'
    });

    return {
      success: true,
      user
    };
  }

  /**
   * Terminate active session
   */
  static logout() {
    const user = this.getCurrentUser();
    
    AuditService.log(AuditAction.LOGOUT, {
      email: user?.email || 'unknown',
      timestamp: new Date().toISOString()
    });

    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  }

  /**
   * Request password reset (Development Mock Interface)
   * In Supabase: delegates to supabase.auth.resetPasswordForEmail(email)
   * @param {string} email 
   * @returns {Promise<{success: boolean, message: string}>}
   */
  static async requestPasswordReset(email) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const trimmed = (email || '').trim().toLowerCase();
    
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please specify a valid institutional email address.');
    }

    // In production, Supabase Auth sends an email with a secure PKCE / OTP link
    return {
      success: true,
      message: `Password reset instructions dispatched to ${trimmed}. (Backend integration pending with Supabase Auth SMTP).`
    };
  }
}
