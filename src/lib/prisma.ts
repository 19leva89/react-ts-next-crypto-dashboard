import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
	const databaseUrl =
		process.env.NODE_ENV === 'production'
			? `${process.env.DATABASE_URL}&connection_limit=10&pool_timeout=20&connect_timeout=60`
			: process.env.DATABASE_URL

	return new PrismaClient({
		datasources: {
			db: {
				url: databaseUrl,
			},
		},

		...(process.env.NODE_ENV === 'production' && {
			log: ['error'],
			errorFormat: 'minimal',
		}),
	})
}

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
	globalThis.prismaGlobal = prisma
}

// Disconnect from database on exit
if (process.env.NODE_ENV === 'production') {
	// For Heroku
	process.on('SIGINT', async () => {
		console.log('Received SIGINT, disconnecting from database...')

		await prisma.$disconnect()
	})

	// For serverless (Vercel) and Docker
	process.on('SIGTERM', async () => {
		console.log('Received SIGTERM, disconnecting from database...')

		await prisma.$disconnect()
	})

	// For unhandled errors
	process.on('beforeExit', async () => {
		await prisma.$disconnect()
	})

	// For uncaught exceptions
	process.on('uncaughtException', async (error) => {
		console.error('Uncaught Exception:', error)
		await prisma.$disconnect()
		process.exit(1)
	})
}
