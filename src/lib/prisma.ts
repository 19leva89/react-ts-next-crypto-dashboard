import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'

//! Do not change the path, made for seed.ts
import { PrismaClient } from '../generated/prisma/client'

const baseUrl = process.env.DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production'

const connectionString = `${baseUrl}&uselibpqcompat=true`

const adapter = new PrismaPg({ connectionString })

const prismaClientSingleton = () => {
	if (!baseUrl) throw new Error('Missing DATABASE_URL environment variable')

	return new PrismaClient({
		adapter,
		log: isProduction ? ['warn', 'error'] : ['info', 'warn', 'error'],
		errorFormat: 'pretty',
	})
}

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (!isProduction) {
	globalThis.prismaGlobal = prisma
}

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
	console.log(`Received ${signal}, disconnecting from database...`)

	await prisma.$disconnect()
	process.exit(0)
}

// Shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Uncaught Exceptions
process.on('uncaughtException', async (error) => {
	console.error('Uncaught Exception:', error)

	await prisma.$disconnect()
	process.exit(1)
})

// Unhandled Rejections
process.on('unhandledRejection', async (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)

	await prisma.$disconnect()
	process.exit(1)
})
