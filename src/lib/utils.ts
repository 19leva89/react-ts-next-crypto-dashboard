import { Metadata } from 'next'
import { twMerge } from 'tailwind-merge'
import { clsx, type ClassValue } from 'clsx'

/**
 * Utility function that combines clsx and tailwind-merge for conditional CSS class handling
 * Merges class names while resolving Tailwind CSS conflicts intelligently
 * @param inputs - Array of class values (strings, objects, arrays, etc.) to be processed
 * @returns Merged and deduplicated class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Converts a relative path to an absolute URL based on the current environment
 * In browser context, returns the path as-is. In server context, constructs full URL using base domain
 * @param path - The relative path to convert to absolute URL
 * @returns Absolute URL string for server-side contexts, or relative path for client-side
 */
export function absoluteUrl(path: string): string {
	// If in a browser, return the relative path
	if (typeof window !== 'undefined') {
		return path
	}

	// Define the base URL
	const baseUrl = process.env.BASE_URL

	// Remove extra slashes to avoid format errors
	return new URL(path, baseUrl).toString()
}

/**
 * Constructs metadata object for Next.js pages with SEO optimization
 * Includes Open Graph, Twitter Card, and favicon configurations
 * @param options - Configuration options for metadata
 * @param options.title - Page title (defaults to 'Crypto')
 * @param options.description - Page description for SEO
 * @param options.image - Social media preview image path
 * @param options.icons - Favicon path
 * @param options.noIndex - Whether to prevent search engine indexing
 * @returns Metadata object configured for Next.js with social media and SEO tags
 */
export function constructMetadata({
	title = 'Crypto',
	description = 'Track crypto trends, analyze data, and manage investments with ease.',
	image = '/img/thumbnail.webp',
	icons = '/favicon.svg',
	noIndex = false,
}: {
	title?: string
	description?: string
	image?: string
	icons?: string
	noIndex?: boolean
} = {}): Metadata {
	return {
		title: {
			default: title,
			template: title ? `%s | ${title}` : `%s`,
		},
		description,
		openGraph: {
			title,
			description,
			images: [
				{
					url: absoluteUrl(image),
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [absoluteUrl(image)],
			creator: '@sobolev',
		},
		icons: {
			icon: icons,
			shortcut: icons,
			apple: icons,
			other: {
				rel: 'icon',
				url: icons,
			},
		},
		metadataBase: new URL(absoluteUrl('')),
		...(noIndex && {
			robots: {
				index: false,
				follow: false,
			},
		}),
	}
}
