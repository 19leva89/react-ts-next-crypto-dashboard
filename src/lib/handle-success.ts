import { NextResponse } from 'next/server'

export const handleApiSuccess = <T = Record<string, unknown>>(
	data: T,
	context: string,
	status: number = 200,
) => {
	if (process.env.NODE_ENV !== 'production') {
		if (Array.isArray(data)) {
			console.log(`✅ Success [${context}]: Returned ${data.length} items`)
		} else if (typeof data === 'object' && data !== null) {
			console.log(`✅ Success [${context}]: Returned object with keys: ${Object.keys(data).join(', ')}`)
		} else {
			console.log(`✅ Success [${context}]: Returned value type: ${typeof data}`)
		}
	}

	return NextResponse.json(data, { status })
}
