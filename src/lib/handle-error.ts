import axios from 'axios'
import { Prisma } from '@prisma/client'

export const handleError = (error: unknown, context: string) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		console.error(`💾 Prisma error [${context}]:`, error.code, error.message)
	} else if (axios.isAxiosError(error)) {
		console.error(`🌐 API error [${context}]:`, error.response?.status, error.message)
	} else if (error instanceof Error) {
		console.error(`🚨 Unexpected error [${context}]:`, error.message)
	} else {
		console.error(`❌ Unknown error [${context}]`, error)
	}

	throw error
}
