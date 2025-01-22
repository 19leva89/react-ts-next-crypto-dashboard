export default async function makeReq(method: string, url: string, data: {} = {}, headers: {} = {}) {
	try {
		const resp = await fetch(url, {
			method,
			// body: JSON.stringify(data)
		})

		if (resp.ok) {
			const data = await resp.json()
			return data
		}

		throw new Error(`Http response with ${resp.status} status code`)
	} catch (e) {
		throw new Error(`Error: ${e}`)
	}
}

export async function makeServerReq(url: string, method: string, useGecko = true) {
	const authHeader: Record<string, string> = {}
	if (useGecko) {
		authHeader['x-cg-demo-api-key'] = `${process.env.GECKO_API_KEY}`
	} else {
		authHeader['X-CMC_PRO_API_KEY'] = `${process.env.CMC_API_KEY}`
	}

	try {
		const resp = await fetch(url, {
			method,
			headers: {
				...authHeader,
			},
		})
		const data = await resp.json()
		return Response.json(data, { status: resp.status })
	} catch (e) {
		return Response.json({ message: 'Server error' }, { status: 500 })
	}
}
