export const IMAGE_HOSTS = [
	'academy-public.coinmarketcap.com',
	'ambcrypto.com',
	'avatars.githubusercontent.com',
	'bitcoinist.com',
	'cdn.decrypt.co',
	'cdn.sanity.io',
	'coin-images.coingecko.com',
	'images.cointelegraph.com',
	'www.newsbtc.com',
] as const

export type ImageHost = (typeof IMAGE_HOSTS)[number]
