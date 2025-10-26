import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'academy-public.coinmarketcap.com',
			},
			{
				protocol: 'https',
				hostname: 'coin-images.coingecko.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
		],
		unoptimized: true,
	},
	reactStrictMode: false,
	// cacheComponents: true,
}

export default nextConfig
