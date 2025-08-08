import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { prisma } from '@/lib/prisma'
import { getCoinData } from '@/data/coin'
import { getUserCoinsList } from '@/data/user'
import { makeReq } from '@/app/api/make-request'
import { recalculateAveragePrice } from '@/app/api/actions'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { addCoinToUserSchema, userCoinDataSchema } from '@/modules/coins/schema'

export const coinsRouter = createTRPCRouter({
	addCoinToUser: protectedProcedure
		.input(addCoinToUserSchema)
		.mutation(async ({ input: { coinId, quantity, price }, ctx }) => {
			if (quantity === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid quantity. Use positive for buy, negative for sell',
				})
			}

			// Getting coin data from fetchCoinData
			const coinData = await getCoinData(coinId)

			// If coinData is empty (error getting data), throw an error
			if (!coinData || !coinData.id) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: `Failed to fetch data for coin ${coinId}`,
				})
			}

			await prisma.$transaction(async (transactionPrisma) => {
				// 1. Receive or create UserCoin
				const userCoin = await transactionPrisma.userCoin.upsert({
					where: {
						userId_coinId: {
							userId: ctx.auth.user.id,
							coinId,
						},
					},
					update: {},
					create: {
						user: { connect: { id: ctx.auth.user.id } },
						coin: { connect: { id: coinId } },
						coinsListIDMap: { connect: { id: coinId } },
					},
					include: { transactions: true },
				})

				// 2. Checking balance for sales
				if (quantity < 0 && Math.abs(quantity) > (userCoin.total_quantity || 0)) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'Not enough coins to sell',
					})
				}

				// 3. Create a transaction record
				await transactionPrisma.userCoinTransaction.create({
					data: {
						quantity,
						price,
						date: new Date(),
						userCoinId: userCoin.id,
					},
				})

				// 4. Recalculating aggregated data
				await recalculateAveragePrice(ctx.auth.user.id, coinId, transactionPrisma)
			})

			return { success: true }
		}),

	addTransactionForUser: protectedProcedure
		.input(
			z.object({
				coinId: z.string(),
				quantity: z.number(),
				price: z.number(),
				date: z.string().transform((str) => new Date(str)),
			}),
		)
		.mutation(async ({ input: { coinId, quantity, price, date }, ctx }) => {
			if (!coinId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Coin ID is required',
				})
			}

			const result = await prisma.$transaction(async (prisma) => {
				// Creating a new transaction
				const newTransaction = await prisma.userCoinTransaction.create({
					data: {
						quantity,
						price,
						date,
						userCoin: {
							connect: { userId_coinId: { userId: ctx.auth.user.id, coinId } },
						},
					},
				})

				// Recalculation of the average price
				await recalculateAveragePrice(ctx.auth.user.id, coinId, prisma)

				return newTransaction
			})

			return result
		}),

	getCoinsListIDMap: protectedProcedure.query(async () => {
		const coins = await prisma.coinsListIDMap.findMany({
			include: { coin: true },
		})

		return coins.map((list) => ({
			id: list.id,
			symbol: list.symbol,
			name: list.name,
			image: list.coin?.image,
		}))
	}),

	getUserCoin: protectedProcedure
		.input(z.string())
		.output(userCoinDataSchema)
		.query(async ({ input: coinId, ctx }) => {
			const userCoin = await prisma.userCoin.findUnique({
				where: { userId_coinId: { userId: ctx.auth.user.id, coinId } },
				select: {
					total_quantity: true,
					total_cost: true,
					average_price: true,
					desired_sell_price: true,
					coinsListIDMap: {
						select: {
							name: true,
							symbol: true,
						},
					},
					coin: {
						select: {
							id: true,
							current_price: true,
							image: true,
							sparkline_in_7d: true,
							price_change_percentage_7d_in_currency: true,
						},
					},
					transactions: {
						select: {
							id: true,
							quantity: true,
							price: true,
							date: true,
							userCoinId: true,
						},
					},
				},
			})

			if (!userCoin) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Coin not found',
				})
			}

			// Launch an update in the background via API
			const response = await makeReq('GET', `/update/user-coin/${coinId}`)

			if (!response || !Array.isArray(response) || response.length === 0) {
				console.log('✅ GET_USER_COINS: Using cached UserCoins from DB')
			}

			// Transform the userCoin object to match the expected return type
			return {
				coinId: userCoin.coin.id,
				name: userCoin.coinsListIDMap.name,
				symbol: userCoin.coinsListIDMap.symbol,
				current_price: userCoin.coin.current_price ?? 0,
				total_quantity: userCoin.total_quantity,
				total_cost: userCoin.total_cost,
				average_price: userCoin.average_price,
				desired_sell_price: userCoin.desired_sell_price ?? 0,
				image: userCoin.coin.image ?? '/svg/coin-not-found.svg',
				sparkline_in_7d: {
					price: (() => {
						const sparkline = userCoin.coin.sparkline_in_7d
						if (typeof sparkline === 'string') {
							try {
								const parsed = JSON.parse(sparkline)
								return Array.isArray(parsed?.price) ? parsed.price : []
							} catch {
								return []
							}
						}
						if (typeof sparkline === 'object' && sparkline !== null && 'price' in sparkline) {
							return Array.isArray(sparkline.price) ? sparkline.price : []
						}
						return []
					})(),
				},
				price_change_percentage_7d_in_currency: userCoin.coin.price_change_percentage_7d_in_currency ?? 0,
				transactions: userCoin.transactions.map((transaction) => ({
					id: transaction.id,
					quantity: transaction.quantity,
					price: transaction.price,
					date: transaction.date.toISOString(),
					userCoinId: transaction.userCoinId,
				})),
			}
		}),

	getUserCoins: protectedProcedure.query(async () => {
		const userCoins = await getUserCoinsList()

		const coinData = userCoins.map((userCoin) => ({
			coinId: userCoin.coin.id,
			name: userCoin.coinsListIDMap.name,
			symbol: userCoin.coinsListIDMap.symbol,
			current_price: userCoin.coin.current_price as number,
			total_quantity: userCoin.total_quantity,
			total_cost: userCoin.total_cost,
			average_price: userCoin.average_price,
			desired_sell_price: userCoin.desired_sell_price as number,
			image: userCoin.coin.image as string,
			sparkline_in_7d: userCoin.coin.sparkline_in_7d as { price: number[] },
			transactions: userCoin.transactions.map((transaction) => ({
				id: transaction.id,
				quantity: transaction.quantity,
				price: transaction.price,
				date: transaction.date.toISOString(),
				userCoinId: transaction.userCoinId,
			})),
		}))

		// Calculate the total invested value of the portfolio
		const totalInvestedValue = coinData.reduce((total, coin) => {
			return total + coin.total_cost
		}, 0)

		// Calculate the total value of the portfolio
		const totalPortfolioValue = coinData.reduce((total, coin) => {
			return total + coin.current_price * coin.total_quantity
		}, 0)

		// Calculate the total future profit of the portfolio
		const plannedProfit = coinData.reduce((total, coin) => {
			return total + coin.desired_sell_price * coin.total_quantity
		}, 0)

		return {
			coinData,
			totalInvestedValue,
			totalPortfolioValue,
			plannedProfit,
		}
	}),

	updateUserCoin: protectedProcedure
		.input(
			z.object({
				coinId: z.string(),
				desiredSellPrice: z.number().optional(),
				transactions: z
					.array(
						z.object({
							id: z.string(),
							quantity: z.number(),
							price: z.number(),
							date: z.string().transform((str) => new Date(str)),
						}),
					)
					.optional(),
			}),
		)
		.mutation(async ({ input: { coinId, desiredSellPrice, transactions }, ctx }) => {
			if (!coinId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Coin ID is required',
				})
			}

			await prisma.$transaction(async (transactionPrisma) => {
				// Validation for transactions
				if (transactions?.some((t) => t.quantity < 0)) {
					const totalOwned = transactions
						.filter((t) => t.quantity > 0)
						.reduce((sum, t) => sum + t.quantity, 0)

					const totalSelling = Math.abs(
						transactions.filter((t) => t.quantity < 0).reduce((sum, t) => sum + t.quantity, 0),
					)

					if (totalSelling > totalOwned) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Not enough coins to sell',
						})
					}
				}

				// Update transactions
				if (transactions?.length) {
					await Promise.all(
						transactions.map((t) =>
							transactionPrisma.userCoinTransaction.update({
								where: { id: t.id },
								data: { ...t },
							}),
						),
					)
				}

				// Update sale price
				if (typeof desiredSellPrice !== 'undefined') {
					await transactionPrisma.userCoin.update({
						where: { userId_coinId: { userId: ctx.auth.user.id, coinId } },
						data: { desired_sell_price: desiredSellPrice },
					})
				}

				// Recalculation of the average price
				if (transactions?.length) {
					await recalculateAveragePrice(ctx.auth.user.id, coinId, transactionPrisma)
				}
			})

			return { success: true }
		}),

	deleteCoinFromUser: protectedProcedure.input(z.string()).mutation(async ({ input: coinId, ctx }) => {
		if (!coinId) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'CoinId is required',
			})
		}

		await prisma.userCoin.delete({
			where: {
				userId_coinId: { userId: ctx.auth.user.id, coinId },
			},
		})

		return { success: true }
	}),

	deleteTransactionFromUser: protectedProcedure
		.input(z.string())
		.mutation(async ({ input: transactionId, ctx }) => {
			if (!transactionId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Transaction ID is required',
				})
			}

			const transaction = await prisma.userCoinTransaction.findUnique({
				where: { id: transactionId },
				include: { userCoin: true },
			})

			if (!transaction) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Transaction not found',
				})
			}

			await prisma.$transaction(async (transactionPrisma) => {
				await transactionPrisma.userCoinTransaction.delete({
					where: { id: transactionId },
				})

				await recalculateAveragePrice(ctx.auth.user.id, transaction.userCoin.coinId, transactionPrisma)
			})

			return { success: true }
		}),
})
