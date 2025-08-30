import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export interface BrowserInfo {
	userAgent: string
	browser: string
	os: string
	device: string
}

export interface LoginContext {
	ipAddress: string
	browserInfo: BrowserInfo
}

/**
 * Get the client IP address from the request headers
 */
export async function getClientIP(): Promise<string> {
	const headersList = await headers()

	// Check various headers to get the real IP
	const xForwardedFor = headersList.get('x-forwarded-for')
	const xRealIP = headersList.get('x-real-ip')
	const xClientIP = headersList.get('x-client-ip')
	const cfConnectingIP = headersList.get('cf-connecting-ip') // Cloudflare
	const xOriginalForwardedFor = headersList.get('x-original-forwarded-for')

	if (xForwardedFor) {
		// x-forwarded-for can contain several IPs, take the first one
		const ips = xForwardedFor.split(',').map((ip) => ip.trim())
		return ips[0]
	}

	if (xRealIP) return xRealIP
	if (xClientIP) return xClientIP
	if (cfConnectingIP) return cfConnectingIP
	if (xOriginalForwardedFor) return xOriginalForwardedFor

	return 'Unknown'
}

/**
 * Get detailed information about the browser, OS and device
 */
export async function getAdvancedBrowserInfo(): Promise<BrowserInfo> {
	const headersList = await headers()
	const userAgent = headersList.get('user-agent') || ''

	const parser = new UAParser(userAgent)
	const result = parser.getResult()

	// Formatting the browser name
	const browserName = result.browser.name || 'Unknown Browser'
	const browserVersion = result.browser.version || ''
	const browser = browserVersion ? `${browserName} ${browserVersion}` : browserName

	// Formatting the OS
	const osName = result.os.name || 'Unknown OS'
	const osVersion = result.os.version || ''
	const os = osVersion ? `${osName} ${osVersion}` : osName

	// Define the device
	let device = 'Desktop'
	if (result.device.type) {
		const deviceType = result.device.type
		const deviceVendor = result.device.vendor || ''
		const deviceModel = result.device.model || ''

		if (deviceType === 'mobile') {
			device = deviceVendor && deviceModel ? `${deviceVendor} ${deviceModel}` : 'Mobile Device'
		} else if (deviceType === 'tablet') {
			device = deviceVendor && deviceModel ? `${deviceVendor} ${deviceModel}` : 'Tablet'
		} else if (deviceType === 'smarttv') {
			device = 'Smart TV'
		} else if (deviceType === 'wearable') {
			device = 'Wearable Device'
		} else if (deviceType === 'console') {
			device = 'Gaming Console'
		}
	}

	return {
		userAgent,
		browser,
		os,
		device,
	}
}

/**
 * Get full context for login (IP + browser info)
 */
export async function getLoginContext(): Promise<LoginContext> {
	const [ipAddress, browserInfo] = await Promise.all([getClientIP(), getAdvancedBrowserInfo()])

	return {
		ipAddress,
		browserInfo,
	}
}

/**
 * Formatting the login notification message
 */
export function formatLoginMessage(context: LoginContext): string {
	const { ipAddress, browserInfo } = context
	const timestamp = new Date().toLocaleString('en-US', {
		timeZone: 'UTC',
		dateStyle: 'full',
		timeStyle: 'medium',
	})

	let message =
		`You have successfully login\n` +
		`📅 Time: ${timestamp} (UTC)\n` +
		`🌐 IP Address: ${ipAddress}\n` +
		`🖥️  Browser: ${browserInfo.browser}\n` +
		`⚙️  System: ${browserInfo.os}\n`

	if (browserInfo.device && browserInfo.device !== 'Desktop') {
		message += `📱 Device: ${browserInfo.device}\n`
	}

	message += `\n⚠️  If this wasn't you, please change your password immediately`

	return message
}
