/**
 * Centralized application route constants and helpers.
 */

export const ROUTES = {
  HOME: '/',
  SERVICES: '/services',
  LOGIN: '/login',
  REGISTER: '/register',
  CUSTOMER_DASHBOARD: '/customer',
  CUSTOMER_BOOKINGS: '/customer/bookings',
  PROVIDER_DASHBOARD: '/provider',
  PROVIDER_SERVICES: '/provider/services',
  PROVIDER_SERVICES_NEW: '/provider/services/new',
  PROVIDER_BOOKINGS: '/provider/bookings',
  PROVIDER_SCHEDULE: '/provider/schedule',
  UNAUTHORIZED: '/unauthorized',
};

/**
 * Returns the default authenticated landing route for a specific user role.
 * @param {string|null} role
 * @returns {string}
 */
export const getDefaultDashboardRoute = (role) => {
  if (role === 'CUSTOMER') {
    return ROUTES.CUSTOMER_DASHBOARD;
  }
  if (role === 'PROVIDER') {
    return ROUTES.PROVIDER_DASHBOARD;
  }
  return ROUTES.HOME;
};
