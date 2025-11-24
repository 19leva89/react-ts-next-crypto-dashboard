import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

//! Do not change the path, made for seed.ts
import { PrismaClient } from '../generated/prisma/client'

const prismaClientSingleton = () => {
	const isVercel = process.env.VERCEL === '1'
	const isProduction = process.env.NODE_ENV === 'production'

	const connectionLimit = isVercel ? 1 : 5

	const databaseUrl = isProduction
		? `${process.env.DATABASE_URL}&connection_limit=${connectionLimit}&pool_timeout=10`
		: `${process.env.DATABASE_URL}`

	const adapter = new PrismaPg({ connectionString: databaseUrl })

	const prisma = new PrismaClient({
		adapter,
		log: isProduction ? ['warn', 'error'] : ['info', 'warn', 'error'],
	})

	return prisma
}

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
	globalThis.prismaGlobal = prisma
}

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
	console.log(`Received ${signal}, disconnecting from database...`)

	await prisma.$disconnect()
	process.exit(0)
}

// Handle different shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// Serverless-specific handling (for Vercel, Netlify, etc.)
if (process.env.VERCEL || process.env.NETLIFY) {
	// Clean up connections after each request in serverless environments
	const originalDisconnect = prisma.$disconnect

	prisma.$disconnect = async () => {
		// Add any cleanup logic here
		await originalDisconnect.apply(prisma)
	}
}

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
	console.error('Uncaught Exception:', error)

	await prisma.$disconnect()
	process.exit(1)
})

// Handle unhandled rejections
process.on('unhandledRejection', async (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason)

	await prisma.$disconnect()
	process.exit(1)
})
