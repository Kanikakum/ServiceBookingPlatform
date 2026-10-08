/**
 * Centralized client-side token storage utility.
 * Safely accesses browser localStorage.
 */

const TOKEN_KEY = 'sbp_auth_token';

export const authStorage = {
  /**
   * Retrieve the JWT token from localStorage.
   * @returns {string|null}
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  /**
   * Store the JWT token in localStorage.
   * @param {string} token
   */
  setToken(token) {
    if (typeof window === 'undefined') return;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (err) {
      console.error('Error saving auth token:', err);
    }
  },

  /**
   * Remove the JWT token from localStorage.
   */
  removeToken() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (err) {
      console.error('Error removing auth token:', err);
    }
  },

  /**
   * Check if a token currently exists.
   * @returns {boolean}
   */
  hasToken() {
    return !!this.getToken();
  },
};
