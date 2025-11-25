import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'

//! Do not change the path, made for seed.ts
import { PrismaClient } from '../generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL
const isProduction = process.env.NODE_ENV === 'production'

const prismaClientSingleton = () => {
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

if (!isProduction) {
	globalThis.prismaGlobal = prisma
}
