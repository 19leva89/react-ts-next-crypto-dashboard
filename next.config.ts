import type { NextConfig } from 'next'

import { IMAGE_HOSTS } from '@/constants/image-hosts'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: IMAGE_HOSTS.map((hostname) => ({
			protocol: 'https',
			hostname,
		})),
	},
	// cacheComponents: true,
	reactCompiler: true,
	reactStrictMode: false,
}

export default nextConfig
