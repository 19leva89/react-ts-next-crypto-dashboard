import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
	return new PrismaClient({
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},

		...(process.env.NODE_ENV === 'production' && {
			log: ['error'],
		}),
	})
}

declare const globalThis: {
	prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
	globalThis.prismaGlobal = prisma
}

// Graceful shutdown for production
if (process.env.NODE_ENV === 'production') {
	process.on('SIGINT', async () => {
		await prisma.$disconnect()

		process.exit(0)
	})
}
