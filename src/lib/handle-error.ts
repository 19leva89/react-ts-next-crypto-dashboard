import axios from 'axios'
import { ZodError } from 'zod'
import { NextResponse } from 'next/server'

import { Prisma } from '@/generated/client'

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

export const handleApiError = (error: unknown, context: string) => {
	// Logging the error
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		console.error(`💾 Prisma error [${context}]:`, error.code, error.message)

		// Prisma specific error handling
		if (error.code === 'P2002') {
			return NextResponse.json(
				{ error: 'Resource already exists', message: 'This record already exists' },
				{ status: 409 },
			)
		}
		if (error.code === 'P2025') {
			return NextResponse.json(
				{ error: 'Resource not found', message: 'The requested record was not found' },
				{ status: 404 },
			)
		}

		return NextResponse.json(
			{ error: 'Database error', message: 'A database error occurred' },
			{ status: 500 },
		)
	} else if (error instanceof ZodError) {
		console.error(`🧪 Validation error [${context}]:`, error.issues)

		return NextResponse.json({ error: 'Validation error', issues: error.issues }, { status: 400 })
	} else if (axios.isAxiosError(error)) {
		console.error(`🌐 API error [${context}]:`, error.response?.status, error.message)

		const status = error.response?.status || 502
		return NextResponse.json(
			{
				error: 'External API error',
				message: process.env.NODE_ENV === 'production' ? 'Upstream service error' : error.message,
			},
			{ status },
		)
	} else if (error instanceof Error) {
		console.error(`🚨 Unexpected error [${context}]:`, error.message)

		return NextResponse.json(
			{
				error: 'Internal server error',
				message: process.env.NODE_ENV === 'production' ? 'An internal error occurred' : error.message,
			},
			{ status: 500 },
		)
	} else {
		console.error(`❌ Unknown error [${context}]`, error)

		return NextResponse.json(
			{ error: 'Unknown error', message: 'An unknown error occurred' },
			{ status: 500 },
		)
	}
}
