import axios from 'axios'

/**
 * Fetches cryptocurrency news from NewsAPI with pagination support
 * Searches for articles containing cryptocurrency-related keywords from trusted domains
 * @param page - Page number for pagination (defaults to 1)
 * @returns Promise resolving to object containing articles array and total results count
 * @throws Error if the API request fails
 */
export async function getCryptoNews(page: number = 1) {
	try {
		const { data } = await axios.get('https://newsapi.org/v2/everything', {
			params: {
				q: 'cryptocurrency OR bitcoin OR ethereum',
				language: 'en',
				domains:
					'ambcrypto.com, bitcoinist.com, coindesk.com, cointelegraph.com, cryptopolitan.com, decrypt.co, newsbtc.com',
				sortBy: 'publishedAt',
				pageSize: 12,
				page,
			},
			headers: {
				Authorization: `Bearer ${process.env.NEWS_API_KEY}`,
			},
		})

		return {
			articles: data.articles,
			totalResults: data.totalResults,
		}
	} catch (error: any) {
		console.error('Error fetching news:', error.response?.data || error.message)

		throw new Error('Failed to fetch news')
	}
}

export const newsSourceLogos: Record<string, string> = {
	CoinDesk: '/img/coindesk-icon.png',
	Bitcoinist: '/img/bitcoinist-icon.png',
	newsBTC: '/img/newsbtc-icon.png',
	Cointelegraph: '/img/cointelegraph-icon.png',
	Decrypt: '/svg/decrypt-icon.svg',
	Cryptopolitan: '/svg/cryptopolitan-icon.svg',
	'Ambcrypto.com': '/img/ambcrypto-icon.png',
}
