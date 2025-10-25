import type { NextConfig } from 'next'
import createNextJsObfuscator from 'nextjs-obfuscator'

import { obfuscatorOptions, pluginOptions } from './obfuscator-options'

const withNextJsObfuscator = createNextJsObfuscator(obfuscatorOptions, pluginOptions)

const nextConfig: NextConfig = withNextJsObfuscator({
	turbopack: {},
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
})

export default nextConfig
