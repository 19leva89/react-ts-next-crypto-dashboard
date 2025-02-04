import axios from 'axios'

import { absoluteUrl } from '@/lib/utils'

async function makeReq(
	method: string,
	url: string,
	data: Record<string, any> = {},
	headers: Record<string, string> = {},
): Promise<any> {
	try {
		const response = await axios({
			method,
			url: absoluteUrl(url),
			data: Object.keys(data).length ? data : undefined,
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
