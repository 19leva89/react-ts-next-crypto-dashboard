export const checkEnvVariables = (requiredEnvVars: string[]) => {
	const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

	if (missingVars.length > 0) {
		throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
	}
}

export const getEnv = (key: string, defaultValue?: string): string => {
	const value = process.env[key] ?? defaultValue
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`)
	}
	return value
}
