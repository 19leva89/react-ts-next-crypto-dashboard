import axios from 'axios'

//! Do not change the path, made for seed.ts
import { absoluteUrl } from './../../lib/utils'

/**
 * Makes an HTTP request using axios with automatic URL construction and error handling
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param url - The relative URL path that will be converted to absolute URL
 * @param params - Request parameters (query params for GET, body data for other methods)
 * @param headers - HTTP headers to include in the request
 * @returns Promise resolving to the response data
 * @throws Error with descriptive message if the request fails
 */
async function makeReq(
	method: string,
	url: string,
	params: Record<string, any> = {},
	headers: Record<string, string> = {},
): Promise<any> {
	try {
		const response = await axios({
			method,
			url: absoluteUrl(url),
			params: method === 'GET' ? params : undefined,
			data: method !== 'GET' && Object.keys(params).length ? params : undefined,
			headers,
		})

		return response.data
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw new Error(`Axios error: ${error.message}`)
		}

		throw new Error(`Error: ${error}`)
	}
}

/**
 * Makes server-side HTTP requests to external APIs with proper authentication
 * Supports both CoinGecko and CoinMarketCap APIs
 * @param url - The full URL to make the request to
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param useGecko - Whether to use CoinGecko API (true) or CoinMarketCap API (false)
 * @returns Promise resolving to an object containing response data and status code
 */
async function makeServerReq(url: string, method: string, useGecko = true): Promise<any> {
	const authHeader: Record<string, string> = useGecko
		? { 'x-cg-demo-api-key': `${process.env.GECKO_API_KEY}` }
		: { 'X-CMC_PRO_API_KEY': `${process.env.CMC_API_KEY}` }

	try {
		const response = await axios({
			method,
			url,
			headers: {
				...authHeader,
			},
		})

		return {
			data: response.data,
			status: response.status,
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error('Axios error:', error.message)
		} else {
			console.error('Unexpected error:', error)
		}

		return {
			status: 500,
			data: { message: 'Server error' },
		}
	}
}

export { makeReq, makeServerReq }
