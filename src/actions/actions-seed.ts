import axios from 'axios'
import { chunk, pick } from 'lodash'
import { Prisma } from '@prisma/client'

// Do not change the path, made for seed.ts

import { prisma } from './../lib/prisma'
import { makeReq } from './../app/api/make-request'
import { TCoinsListData } from './../modules/dashboard/schema'

const BATCH_SIZE = 50

const handleError = (error: unknown, context: string) => {
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

export const updateCoinsListIDMapFromAPI = async (): Promise<void> => {
	try {
		console.log('🔄 Requesting current CoinsListIDMap via API...')
		const response = await makeReq('GET', '/gecko/coins-get')

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsListIDMapFromAPI')

			return
		}

		console.log(`📊 CoinsListIDMap is available in API: ${response.length}`)

		// Breaking data into chunks
		const coinIdChunks = chunk(response, BATCH_SIZE)

		// Update coins in batches
		for (const batch of coinIdChunks) {
			await prisma.$transaction([
				// Update coinsListIDMap
				...batch.map((coin) =>
					prisma.coinsListIDMap.upsert({
						where: { id: coin.id },
						update: coin,
						create: coin,
					}),
				),
			])
		}

		console.log('✅ Records CoinsListIDMap updated!')
	} catch (error) {
		handleError(error, 'GET_COINS_LIST_ID_MAP')

		return
	}
}

export const updateCoinsListIDMapImageFromAPI = async (startPage: number = 1): Promise<void> => {
	try {
		console.log('🔄 Requesting current CoinsListIDMap via API...')
		const response = await makeReq('GET', '/gecko/coins-get')

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsListIDMapFromAPI')
			return
		}

		console.log(`📊 CoinsListIDMap is available in API: ${response.length}`)

		const per_page = 250
		const totalCoins = response.length
		const totalPages = Math.ceil(totalCoins / per_page)

		console.log(
			`🔄 Requesting current CoinsListIDMapImage via API... (${totalPages} pages, starting from page ${startPage})`,
		)

		// Get images for all coins in parts with error handling
		let allCoinsWithImages: any[] = []

		for (let page = startPage; page <= totalPages; page++) {
			console.log(`📄 Processing page ${page}/${totalPages}...`)

			let retryCount = 0
			const maxRetries = 3
			let success = false

			while (retryCount < maxRetries && !success) {
				try {
					// Add a small delay between requests
					if (page > startPage || retryCount > 0) {
						await new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second delay
					}

					const responseImage = await makeReq('GET', '/gecko/coins-image', {
						page,
						per_page,
					})

					if (!responseImage || !Array.isArray(responseImage)) {
						console.warn(`⚠️ Empty response for page ${page}, skipping...`)
						success = true // Skip this page

						continue
					}

					console.log(`📊 CoinsListIDMapImage page ${page}: ${responseImage.length} coins`)

					allCoinsWithImages.push(...responseImage)
					success = true
				} catch (error: any) {
					retryCount++
					console.warn(
						`⚠️ Error on page ${page}, attempt ${retryCount}/${maxRetries}:`,
						error?.message || error,
					)

					if (retryCount >= maxRetries) {
						console.error(
							`❌ Failed to get page ${page} after ${maxRetries} attempts. Continuing with next page...`,
						)

						// Logging the page to try again later
						console.log(`🔄 To resume from this page, call: updateCoinsListIDMapImageFromAPI(${page})`)
					} else {
						// Increase the delay on retries
						await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount))
					}
				}
			}

			// We update the database every 10 pages or at the end
			if (allCoinsWithImages.length > 0 && (page % 10 === 0 || page === totalPages)) {
				console.log(`💾 Updating database with ${allCoinsWithImages.length} coins...`)

				try {
					// Breaking data into chunks for database updates
					const coinIdChunks = chunk(allCoinsWithImages, BATCH_SIZE)

					// Update coins in batches
					for (let i = 0; i < coinIdChunks.length; i++) {
						const batch = coinIdChunks[i]
						console.log(`💾 Updating batch ${i + 1}/${coinIdChunks.length} (${batch.length} coins)...`)

						await prisma.$transaction(
							async (tx) => {
								await Promise.all(
									batch.map((coin) =>
										tx.coinsListIDMap.upsert({
											where: { id: coin.id },
											update: { image: coin.image },
											create: {
												id: coin.id,
												symbol: coin.symbol,
												name: coin.name,
												image: coin.image,
											},
										}),
									),
								)
							},
							{ timeout: 30000 }, // 30 seconds transaction timeout
						)

						console.log(`✅ Updated ${batch.length} coins in database`)
					}

					console.log(`✅ Updated ${allCoinsWithImages.length} coins in database`)

					allCoinsWithImages = [] // Clearing the array after a successful update
				} catch (error: any) {
					console.error('❌ Database update error:', error?.message || error)
					console.log(
						`🔄 Data is preserved. To retry, call: updateCoinsListIDMapImageFromAPI(${Math.max(1, page - 9)})`,
					)
				}
			}
		}

		console.log('✅ All pages processed!')
	} catch (error) {
		handleError(error, 'GET_COINS_LIST_ID_MAP')
		return
	}
}

export const getCoinsList = async (): Promise<TCoinsListData> => {
	try {
		console.log('🔄 Requesting current CoinsList via API...')
		const response = await makeReq('GET', '/gecko/list')

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsList')

			return [] as TCoinsListData
		}

		console.log(`📊 CoinsList is available in API: ${response.length}`)

		const transformCoinData = (coin: any) => ({
			description: coin.description,
			image: coin.image,
			current_price: coin.current_price,
			market_cap: coin.market_cap,
			market_cap_rank: coin.market_cap_rank,
			total_volume: coin.total_volume,
			high_24h: coin.high_24h,
			low_24h: coin.low_24h,
			price_change_percentage_24h: coin.price_change_percentage_24h,
			circulating_supply: coin.circulating_supply,
			sparkline_in_7d: coin.sparkline_in_7d,
			price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency,
			price_change_percentage_24h_in_currency: coin.price_change_percentage_24h_in_currency,
			price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
			price_change_percentage_30d_in_currency: coin.price_change_percentage_30d_in_currency,
			price_change_percentage_1y_in_currency: coin.price_change_percentage_1y_in_currency,
		})

		// Breaking data into chunks
		const batches = chunk(response, BATCH_SIZE)

		// Update coins in batches
		for (const batch of batches) {
			await prisma.$transaction(
				batch.flatMap((coin) => [
					// Update coinsListIDMap
					prisma.coinsListIDMap.upsert({
						where: { id: coin.id },
						update: { symbol: coin.symbol, name: coin.name },
						create: { id: coin.id, ...pick(coin, ['symbol', 'name']) },
					}),

					// Update coin
					prisma.coin.upsert({
						where: { id: coin.id },
						update: transformCoinData(coin),
						create: {
							id: coin.id,
							coinsListIDMapId: coin.id,
							...transformCoinData(coin),
						},
					}),
				]),
			)
		}

		console.log('✅ Records CoinsListIDMap updated!')

		return response.map((coin) => ({
			...pick(coin, ['id', 'symbol', 'name']),
			...transformCoinData(coin),
		}))
	} catch (error) {
		handleError(error, 'GET_COINS_LIST')

		return []
	}
}

export const deleteNonExistentCoinsListIDMap = async (): Promise<void> => {
	try {
		console.log('🔄 Requesting current coins list from API...')
		const apiResponse = await makeReq('GET', '/gecko/coins-get')

		if (!apiResponse || !Array.isArray(apiResponse) || apiResponse.length === 0) {
			console.warn('⚠️ Empty response from API, aborting cleanup')
			return
		}

		console.log(`📊 API coins count: ${apiResponse.length}`)

		// Create a Set to quickly find coin IDs from the API
		const apiCoinIds = new Set(apiResponse.map((coin: any) => coin.id))

		console.log('🔍 Fetching all coins from database...')

		// Get all coins from the DB
		const dbCoins = await prisma.coinsListIDMap.findMany({
			select: {
				id: true,
				name: true,
				symbol: true,
				userCoins: {
					select: {
						id: true,
					},
				},
			},
		})

		console.log(`📊 Database coins count: ${dbCoins.length}`)

		// Find coins that are in the DB but not in the API
		const coinsToDelete = dbCoins.filter((dbCoin) => !apiCoinIds.has(dbCoin.id))

		console.log(`🗑️ Found ${coinsToDelete.length} coins to potentially delete`)

		if (coinsToDelete.length === 0) {
			console.log('✅ No coins to delete - database is up to date')
			return
		}

		// Divide coins into those that are associated with users and those that are not
		const coinsWithUserData = coinsToDelete.filter((coin) => coin.userCoins && coin.userCoins.length > 0)

		const coinsWithoutUserData = coinsToDelete.filter(
			(coin) => !coin.userCoins || coin.userCoins.length === 0,
		)

		console.log(`⚠️ Coins with user data (will be kept): ${coinsWithUserData.length}`)
		console.log(`🗑️ Coins without user data (will be deleted): ${coinsWithoutUserData.length}`)

		// Log coins that will be saved due to communication with users
		if (coinsWithUserData.length > 0) {
			console.log('📋 Coins kept due to user associations:')

			coinsWithUserData.forEach((coin) => {
				console.log(`  - ${coin.symbol} (${coin.name}) - ${coin.userCoins?.length || 0} user associations`)
			})
		}

		if (coinsWithoutUserData.length === 0) {
			console.log('✅ All non-existent coins have user data - nothing to delete')

			return
		}

		// Delete coins without user data in parts
		const deletionBatches = []

		for (let i = 0; i < coinsWithoutUserData.length; i += BATCH_SIZE) {
			deletionBatches.push(coinsWithoutUserData.slice(i, i + BATCH_SIZE))
		}

		console.log(`🗑️ Deleting coins in ${deletionBatches.length} batches...`)

		let totalDeleted = 0

		for (let i = 0; i < deletionBatches.length; i++) {
			const batch = deletionBatches[i]
			const batchIds = batch.map((coin) => coin.id)

			console.log(`🗑️ Deleting batch ${i + 1}/${deletionBatches.length} (${batch.length} coins)...`)

			try {
				const deleteResult = await prisma.coinsListIDMap.deleteMany({
					where: {
						id: {
							in: batchIds,
						},
					},
				})

				console.log(`✅ Deleted ${deleteResult.count} coins from batch ${i + 1}`)

				totalDeleted += deleteResult.count

				// A short break between batches
				if (i < deletionBatches.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 500))
				}
			} catch (error: any) {
				console.error(`❌ Failed to delete batch ${i + 1}:`, error?.message || error)

				// Try to remove one coin at a time from this batch
				console.log('🔄 Attempting individual deletions for failed batch...')

				for (const coin of batch) {
					try {
						await prisma.coinsListIDMap.delete({
							where: { id: coin.id },
						})

						console.log(`✅ Individually deleted: ${coin.symbol} (${coin.name})`)

						totalDeleted++
					} catch (individualError: any) {
						console.warn(`⚠️ Failed to delete ${coin.symbol} (${coin.id}):`, individualError?.message)
					}
				}
			}
		}

		console.log(`✅ Cleanup completed! Deleted ${totalDeleted} coins total`)
		console.log(`📊 Remaining coins in database: ${dbCoins.length - totalDeleted}`)
	} catch (error) {
		handleError(error, 'DELETE_NON_EXISTENT_COINS')

		return
	}
}
