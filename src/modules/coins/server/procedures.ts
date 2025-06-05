import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { createTRPCRouter, protectedProcedure } from '@/trpc/init'
import { getUserCoinData, getUserCoinsList } from '@/app/api/actions'

export const coinsRouter = createTRPCRouter({
	getUserCoin: protectedProcedure.input(z.string()).query(async ({ input: coinId }) => {
		const userCoin = await getUserCoinData(coinId)
		if (!userCoin || Array.isArray(userCoin)) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Coin not found',
			})
		}

		return userCoin
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
				date: transaction.date,
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
})
