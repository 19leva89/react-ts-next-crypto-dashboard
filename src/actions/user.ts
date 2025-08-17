'use server'

import { formatValue } from '@/lib'
import { prisma } from '@/lib/prisma'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { COINS_UPDATE_INTERVAL } from '@/constants/intervals'
import { sendNotificationPriceEmail } from '@/lib/send-email'

export const updateUserCoinsList = async (userId: string): Promise<any> => {
	try {
		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - COINS_UPDATE_INTERVAL)

		// Get a list of user coins
		const coinsToUpdate = await prisma.userCoin.findMany({
			where: {
				userId,
				updatedAt: { lt: updateTime },
			},
			orderBy: { updatedAt: 'asc' },
			take: 50, // Limit in DB
			select: {
				coinId: true,
				coin: { select: { id: true } },
			},
		})

		if (!coinsToUpdate.length) {
			console.log('✅ Using cached UserCoins')

			return prisma.userCoin.findMany({
				where: { userId },
				include: { coin: true },
			})
		}

		// Forming a string for an API request
		const coinIds = coinsToUpdate.map((coin) => encodeURIComponent(coin.coinId)).join('%2C')

		// Requesting fresh data from the API
		console.log('🔄 Outdated records, request UserCoins via API...')
		const response = await makeReq('GET', `/gecko/user/${coinIds}`)

		if (!response || !Array.isArray(response) || !response.length) {
			console.warn('⚠️ UPDATE_USER_COINS: Empty response from API, using old UserCoinsList')

			return prisma.userCoin.findMany({
				where: { userId },
				include: { coin: true },
			})
		}

		// Batch update
		const updateOperations = response.flatMap((coin) => [
			prisma.coin.upsert({
				where: { id: coin.id },
				update: {
					current_price: coin.current_price,
					sparkline_in_7d: coin.sparkline_in_7d,
					updatedAt: currentTime,
				},
				create: {
					id: coin.id,
					coinsListIDMapId: coin.id,
					current_price: coin.current_price,
					sparkline_in_7d: coin.sparkline_in_7d,
					updatedAt: currentTime,
				},
			}),
			prisma.userCoin.updateMany({
				where: {
					userId,
					coinId: coin.id,
				},
				data: { updatedAt: currentTime },
			}),
		])

		await prisma.$transaction(updateOperations)

		console.log('✅ Records UserCoinsList updated!')

		// Returning an updated list of coins
		return await prisma.userCoin.findMany({
			where: { userId },
			include: { coin: true },
		})
	} catch (error) {
		handleError(error, 'UPDATE_USER_COINS_LIST')
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateUserCoinData = async (coinId: string) => {}

export const notifyUsersOnPriceTarget = async () => {
	const userCoins = await prisma.userCoin.findMany({
		where: {
			desired_sell_price: {
				not: null,
			},
			coin: {
				current_price: {
					not: null,
				},
			},
		},
		include: {
			coinsListIDMap: true,
			coin: true,
			user: true,
		},
	})

	// Grouping by user
	const userMap: Record<
		string,
		{
			email: string
			coins: {
				id: string
				name: string
				image: string
				currentPrice: number
				desiredPrice: number
			}[]
		}
	> = {}

	for (const userCoin of userCoins) {
		const { user, coin, desired_sell_price, coinsListIDMap } = userCoin

		if (!user.email || desired_sell_price == null || coin.current_price == null) continue
		if (coin.current_price < desired_sell_price) continue

		if (!userMap[user.id]) {
			userMap[user.id] = {
				email: user.email,
				coins: [],
			}
		}

		userMap[user.id].coins.push({
			id: coin.id,
			name: coinsListIDMap?.name ?? coin.id,
			image: coinsListIDMap.image ?? '/svg/coin-not-found.svg',
			currentPrice: coin.current_price,
			desiredPrice: desired_sell_price,
		})
	}

	// Sending emails to users and creating notifications
	for (const userId in userMap) {
		const { email, coins } = userMap[userId]

		try {
			// Creating notifications
			for (const coin of coins) {
				await prisma.notification.create({
					data: {
						userId,
						type: 'PRICE_ALERT',
						title: '🎯 Target price reached!',
						message: `${coin.name} reached your target $${formatValue(coin.currentPrice, true)}`,
						coinId: coin.id,
					},
				})
			}

			// Sending emails
			await sendNotificationPriceEmail(email, coins)
		} catch (error) {
			handleError(error, 'NOTIFY_USER_ON_PRICE_TARGET')
		}
	}
}
