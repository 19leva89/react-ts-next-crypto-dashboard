/**
 * An array of routes that are accessible to the protected
 * These routes require authentication
 * @type {string[]}
 */
export const protectedRoutes = [
	'/billing',
	'/cards',
	'/charts',
	'/coins',
	'/notifications',
	'/settings',
	'/transactions',
]

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = ['/auth/reset', '/auth/new-password', '/auth/not-auth']

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/coins'
