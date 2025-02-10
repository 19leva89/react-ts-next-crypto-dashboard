// Do not change the path, made for seed.ts
import { prisma } from './../src/lib/prisma'
import { getCoinsList, updateCoinsListIDMapFromAPI } from './../src/app/api/actions-seed'

//! To run the command "npx prisma db seed" the server must be running

// ID пользователя
export const userId = 'cm6z43glm0000o8ts2cvyy5mo'

async function up() {
	// Запускает обновление списка криптовалют ~20мин
	// await updateCoinsListIDMapFromAPI()

	// Получаем список криптовалют TOP250
	// await getCoinsList()

	// Создаем запись в Coin и UserCoin
	// #1
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: '1inch' },
			update: {},
			create: {
				id: '1inch',
				coinsListIDMapId: '1inch',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: '1inch',
					coinId: '1inch',
					coinsListIDMapId: '1inch',
					quantity: 20,
					buy_price: 0.544147,
					sell_price: 7.5,
				},
			],
		})
	})

	// #2
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'aave' },
			update: {},
			create: {
				id: 'aave',
				coinsListIDMapId: 'aave',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'aave',
					coinId: 'aave',
					coinsListIDMapId: 'aave',
					quantity: 0.2,
					buy_price: 65.35,
					sell_price: 520,
				},
			],
		})
	})

	// #3
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'algorand' },
			update: {},
			create: {
				id: 'algorand',
				coinsListIDMapId: 'algorand',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'algorand',
					coinId: 'algorand',
					coinsListIDMapId: 'algorand',
					quantity: 130.10011,
					buy_price: 0.2136,
					sell_price: 2.5,
				},
			],
		})
	})

	// #4
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'cosmos' },
			update: {},
			create: {
				id: 'cosmos',
				coinsListIDMapId: 'cosmos',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'cosmos',
					coinId: 'cosmos',
					coinsListIDMapId: 'cosmos',
					quantity: 4.684885,
					buy_price: 5.82,
					sell_price: 50,
				},
			],
		})
	})

	// #5
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'avalanche-2' },
			update: {},
			create: {
				id: 'avalanche-2',
				coinsListIDMapId: 'avalanche-2',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'avalanche-2',
					coinId: 'avalanche-2',
					coinsListIDMapId: 'avalanche-2',
					quantity: 1,
					buy_price: 14.8,
					sell_price: 125,
				},
			],
		})
	})

	// #6
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'basic-attention-token' },
			update: {},
			create: {
				id: 'basic-attention-token',
				coinsListIDMapId: 'basic-attention-token',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'basic-attention-token',
					coinId: 'basic-attention-token',
					coinsListIDMapId: 'basic-attention-token',
					quantity: 60,
					buy_price: 0.171502,
					sell_price: 1.7,
				},
			],
		})
	})

	// #7
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'bitcoin' },
			update: {},
			create: {
				id: 'bitcoin',
				coinsListIDMapId: 'bitcoin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'bitcoin',
					coinId: 'bitcoin',
					coinsListIDMapId: 'bitcoin',
					quantity: 0.00963772,
					buy_price: 54500,
					sell_price: 120000,
				},
			],
		})
	})

	// #8
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'pancakeswap-token' },
			update: {},
			create: {
				id: 'pancakeswap-token',
				coinsListIDMapId: 'pancakeswap-token',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'pancakeswap-token',
					coinId: 'pancakeswap-token',
					coinsListIDMapId: 'pancakeswap-token',
					quantity: 7,
					buy_price: 1.49,
					sell_price: 40,
				},
			],
		})
	})

	// #9
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'celo' },
			update: {},
			create: {
				id: 'celo',
				coinsListIDMapId: 'celo',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'celo',
					coinId: 'celo',
					coinsListIDMapId: 'celo',
					quantity: 15,
					buy_price: 0.635,
					sell_price: 7.5,
				},
			],
		})
	})

	// #10
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'celer-network' },
			update: {},
			create: {
				id: 'celer-network',
				coinsListIDMapId: 'celer-network',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'celer-network',
					coinId: 'celer-network',
					coinsListIDMapId: 'celer-network',
					quantity: 350,
					buy_price: 0.02536,
					sell_price: 0.15,
				},
			],
		})
	})

	// #11
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'coin98' },
			update: {},
			create: {
				id: 'coin98',
				coinsListIDMapId: 'coin98',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'coin98',
					coinId: 'coin98',
					coinsListIDMapId: 'coin98',
					quantity: 40,
					buy_price: 0.2597,
					sell_price: 5,
				},
			],
		})
	})

	// #12
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'crypto-com-chain' },
			update: {},
			create: {
				id: 'crypto-com-chain',
				coinsListIDMapId: 'crypto-com-chain',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'crypto-com-chain',
					coinId: 'crypto-com-chain',
					coinsListIDMapId: 'crypto-com-chain',
					quantity: 150,
					buy_price: 0.05916,
					sell_price: 0.8,
				},
			],
		})
	})

	// #13
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'dash' },
			update: {},
			create: {
				id: 'dash',
				coinsListIDMapId: 'dash',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'dash',
					coinId: 'dash',
					coinsListIDMapId: 'dash',
					quantity: 0.3,
					buy_price: 45.6143,
					sell_price: 450,
				},
			],
		})
	})

	// #14
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'dogecoin' },
			update: {},
			create: {
				id: 'dogecoin',
				coinsListIDMapId: 'dogecoin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'dogecoin',
					coinId: 'dogecoin',
					coinsListIDMapId: 'dogecoin',
					quantity: 300,
					buy_price: 0.223235,
					sell_price: 0.6,
				},
			],
		})
	})

	// #15
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'polkadot' },
			update: {},
			create: {
				id: 'polkadot',
				coinsListIDMapId: 'polkadot',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'polkadot',
					coinId: 'polkadot',
					coinsListIDMapId: 'polkadot',
					quantity: 10,
					buy_price: 6.16109,
					sell_price: 50,
				},
			],
		})
	})

	// #16
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'elrond-erd-2' },
			update: {},
			create: {
				id: 'elrond-erd-2',
				coinsListIDMapId: 'elrond-erd-2',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'elrond-erd-2',
					coinId: 'elrond-erd-2',
					coinsListIDMapId: 'elrond-erd-2',
					quantity: 1.2205455,
					buy_price: 27.175,
					sell_price: 450,
				},
			],
		})
	})

	// #17
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'eos' },
			update: {},
			create: {
				id: 'eos',
				coinsListIDMapId: 'eos',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'eos',
					coinId: 'eos',
					coinsListIDMapId: 'eos',
					quantity: 11,
					buy_price: 1.20952,
					sell_price: 14.5,
				},
			],
		})
	})

	// #18
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'filecoin' },
			update: {},
			create: {
				id: 'filecoin',
				coinsListIDMapId: 'filecoin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'filecoin',
					coinId: 'filecoin',
					coinsListIDMapId: 'filecoin',
					quantity: 1.2486047,
					buy_price: 7.75,
					sell_price: 180,
				},
			],
		})
	})

	// #19
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'flow' },
			update: {},
			create: {
				id: 'flow',
				coinsListIDMapId: 'flow',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'flow',
					coinId: 'flow',
					coinsListIDMapId: 'flow',
					quantity: 13,
					buy_price: 0.763,
					sell_price: 28,
				},
			],
		})
	})

	// #20
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'moonbeam' },
			update: {},
			create: {
				id: 'moonbeam',
				coinsListIDMapId: 'moonbeam',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'moonbeam',
					coinId: 'moonbeam',
					coinsListIDMapId: 'moonbeam',
					quantity: 50,
					buy_price: 0.2376,
					sell_price: 10,
				},
			],
		})
	})

	// #21
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'hedera-hashgraph' },
			update: {},
			create: {
				id: 'hedera-hashgraph',
				coinsListIDMapId: 'hedera-hashgraph',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'hedera-hashgraph',
					coinId: 'hedera-hashgraph',
					coinsListIDMapId: 'hedera-hashgraph',
					quantity: 200,
					buy_price: 0.04613,
					sell_price: 0.5,
				},
			],
		})
	})

	// #22
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'internet-computer' },
			update: {},
			create: {
				id: 'internet-computer',
				coinsListIDMapId: 'internet-computer',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'internet-computer',
					coinId: 'internet-computer',
					coinsListIDMapId: 'internet-computer',
					quantity: 2,
					buy_price: 5.15876,
					sell_price: 55,
				},
			],
		})
	})

	// #23
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'iota' },
			update: {},
			create: {
				id: 'iota',
				coinsListIDMapId: 'iota',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'iota',
					coinId: 'iota',
					coinsListIDMapId: 'iota',
					quantity: 110,
					buy_price: 0.201,
					sell_price: 2.5,
				},
			],
		})
	})

	// #24
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'kusama' },
			update: {},
			create: {
				id: 'kusama',
				coinsListIDMapId: 'kusama',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'kusama',
					coinId: 'kusama',
					coinsListIDMapId: 'kusama',
					quantity: 0.25,
					buy_price: 32.6398,
					sell_price: 600,
				},
			],
		})
	})

	// #25
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'loopring' },
			update: {},
			create: {
				id: 'loopring',
				coinsListIDMapId: 'loopring',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'loopring',
					coinId: 'loopring',
					coinsListIDMapId: 'loopring',
					quantity: 40,
					buy_price: 0.255662,
					sell_price: 3.5,
				},
			],
		})
	})

	// #26
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'chainlink' },
			update: {},
			create: {
				id: 'chainlink',
				coinsListIDMapId: 'chainlink',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'chainlink',
					coinId: 'chainlink',
					coinsListIDMapId: 'chainlink',
					quantity: 1.5,
					buy_price: 6.62,
					sell_price: 50,
				},
			],
		})
	})

	// #27
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'decentraland' },
			update: {},
			create: {
				id: 'decentraland',
				coinsListIDMapId: 'decentraland',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'decentraland',
					coinId: 'decentraland',
					coinsListIDMapId: 'decentraland',
					quantity: 25,
					buy_price: 0.4161,
					sell_price: 4,
				},
			],
		})
	})

	// #28
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'maker' },
			update: {},
			create: {
				id: 'maker',
				coinsListIDMapId: 'maker',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'maker',
					coinId: 'maker',
					coinsListIDMapId: 'maker',
					quantity: 0.015,
					buy_price: 678.07,
					sell_price: 5600,
				},
			],
		})
	})

	// #29
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'near' },
			update: {},
			create: {
				id: 'near',
				coinsListIDMapId: 'near',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'near',
					coinId: 'near',
					coinsListIDMapId: 'near',
					quantity: 7.1920949,
					buy_price: 2.605,
					sell_price: 21,
				},
			],
		})
	})

	// #30
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'neo' },
			update: {},
			create: {
				id: 'neo',
				coinsListIDMapId: 'neo',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'neo',
					coinId: 'neo',
					coinsListIDMapId: 'neo',
					quantity: 2,
					buy_price: 8.34422,
					sell_price: 140,
				},
			],
		})
	})

	// #31
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'qtum' },
			update: {},
			create: {
				id: 'qtum',
				coinsListIDMapId: 'qtum',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'qtum',
					coinId: 'qtum',
					coinsListIDMapId: 'qtum',
					quantity: 4,
					buy_price: 2.74,
					sell_price: 27,
				},
			],
		})
	})

	// #32
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'reef' },
			update: {},
			create: {
				id: 'reef',
				coinsListIDMapId: 'reef',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'reef',
					coinId: 'reef',
					coinsListIDMapId: 'reef',
					quantity: 3600,
					buy_price: 0.00276808,
					sell_price: 0.06,
				},
			],
		})
	})

	// #33
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'shiba-inu' },
			update: {},
			create: {
				id: 'shiba-inu',
				coinsListIDMapId: 'shiba-inu',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'shiba-inu',
					coinId: 'shiba-inu',
					coinsListIDMapId: 'shiba-inu',
					quantity: 1300000,
					buy_price: 0.00000832,
					sell_price: 0.00009,
				},
			],
		})
	})

	// #34
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'sonic-3' },
			update: {},
			create: {
				id: 'sonic-3',
				coinsListIDMapId: 'sonic-3',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'sonic-3',
					coinId: 'sonic-3',
					coinsListIDMapId: 'sonic-3',
					quantity: 50,
					buy_price: 0.1877,
					sell_price: 9,
				},
			],
		})
	})

	// #35
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'sushi' },
			update: {},
			create: {
				id: 'sushi',
				coinsListIDMapId: 'sushi',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'sushi',
					coinId: 'sushi',
					coinsListIDMapId: 'sushi',
					quantity: 10,
					buy_price: 1.21643,
					sell_price: 21.5,
				},
			],
		})
	})

	// #36
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'tether' },
			update: {},
			create: {
				id: 'tether',
				coinsListIDMapId: 'tether',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'tether',
					coinId: 'tether',
					coinsListIDMapId: 'tether',
					quantity: 714.07,
					buy_price: 1,
				},
			],
		})
	})

	// #37
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'the-sandbox' },
			update: {},
			create: {
				id: 'the-sandbox',
				coinsListIDMapId: 'the-sandbox',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'the-sandbox',
					coinId: 'the-sandbox',
					coinsListIDMapId: 'the-sandbox',
					quantity: 12.66511,
					buy_price: 0.895,
					sell_price: 6.5,
				},
			],
		})
	})

	// #38
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'trust-wallet-token' },
			update: {},
			create: {
				id: 'trust-wallet-token',
				coinsListIDMapId: 'trust-wallet-token',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'trust-wallet-token',
					coinId: 'trust-wallet-token',
					coinsListIDMapId: 'trust-wallet-token',
					quantity: 15,
					buy_price: 1.431005,
					sell_price: 3.5,
				},
			],
		})
	})

	// #39
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'uniswap' },
			update: {},
			create: {
				id: 'uniswap',
				coinsListIDMapId: 'uniswap',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'uniswap',
					coinId: 'uniswap',
					coinsListIDMapId: 'uniswap',
					quantity: 2,
					buy_price: 5.45,
					sell_price: 43,
				},
			],
		})
	})

	// #40
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'vechain' },
			update: {},
			create: {
				id: 'vechain',
				coinsListIDMapId: 'vechain',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'vechain',
					coinId: 'vechain',
					coinsListIDMapId: 'vechain',
					quantity: 500,
					buy_price: 0.0220095,
					sell_price: 0.25,
				},
			],
		})
	})

	// #41
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'woo-network' },
			update: {},
			create: {
				id: 'woo-network',
				coinsListIDMapId: 'woo-network',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'woo-network',
					coinId: 'woo-network',
					coinsListIDMapId: 'woo-network',
					quantity: 50,
					buy_price: 0.139,
					sell_price: 1.6,
				},
			],
		})
	})

	// #42
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'nem' },
			update: {},
			create: {
				id: 'nem',
				coinsListIDMapId: 'nem',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'nem',
					coinId: 'nem',
					coinsListIDMapId: 'nem',
					quantity: 250,
					buy_price: 0.0392019,
					sell_price: 0.8,
				},
			],
		})
	})

	// #43
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'tezos' },
			update: {},
			create: {
				id: 'tezos',
				coinsListIDMapId: 'tezos',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'tezos',
					coinId: 'tezos',
					coinsListIDMapId: 'tezos',
					quantity: 21.869092,
					buy_price: 0.825574,
					sell_price: 9.8,
				},
			],
		})
	})

	// #44
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'zilliqa' },
			update: {},
			create: {
				id: 'zilliqa',
				coinsListIDMapId: 'zilliqa',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'zilliqa',
					coinId: 'zilliqa',
					coinsListIDMapId: 'zilliqa',
					quantity: 400,
					buy_price: 0.02843,
					sell_price: 0.24,
				},
			],
		})
	})

	// #45
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'usd-coin' },
			update: {},
			create: {
				id: 'usd-coin',
				coinsListIDMapId: 'usd-coin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'usd-coin',
					coinId: 'usd-coin',
					coinsListIDMapId: 'usd-coin',
					quantity: 1.4306788,
					buy_price: 1,
				},
			],
		})
	})

	// #46
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'derive' },
			update: {},
			create: {
				id: 'derive',
				coinsListIDMapId: 'derive',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'derive',
					coinId: 'derive',
					coinsListIDMapId: 'derive',
					quantity: 101.167327,
					buy_price: 0.1,
					sell_price: 1,
				},
			],
		})
	})

	// #47
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'sosovalue' },
			update: {},
			create: {
				id: 'sosovalue',
				coinsListIDMapId: 'sosovalue',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'sosovalue',
					coinId: 'sosovalue',
					coinsListIDMapId: 'sosovalue',
					quantity: 53.49,
					buy_price: 0.825,
					sell_price: 2,
				},
			],
		})
	})

	// #48
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'aptos' },
			update: {},
			create: {
				id: 'aptos',
				coinsListIDMapId: 'aptos',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'aptos',
					coinId: 'aptos',
					coinsListIDMapId: 'aptos',
					quantity: 3.00585339,
					buy_price: 6.7,
					sell_price: 25,
				},
			],
		})
	})

	// #49
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'ondo-finance' },
			update: {},
			create: {
				id: 'ondo-finance',
				coinsListIDMapId: 'ondo-finance',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'ondo-finance',
					coinId: 'ondo-finance',
					coinsListIDMapId: 'ondo-finance',
					quantity: 15,
					buy_price: 1.3,
					sell_price: 15,
				},
			],
		})
	})

	// #50
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'cardano' },
			update: {},
			create: {
				id: 'cardano',
				coinsListIDMapId: 'cardano',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'cardano',
					coinId: 'cardano',
					coinsListIDMapId: 'cardano',
					quantity: 20,
					buy_price: 0.989,
					sell_price: 3,
				},
			],
		})
	})

	// #51
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'rowan-coin' },
			update: {},
			create: {
				id: 'rowan-coin',
				coinsListIDMapId: 'rowan-coin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'rowan-coin',
					coinId: 'rowan-coin',
					coinsListIDMapId: 'rowan-coin',
					quantity: 2000,
					buy_price: 0.01044,
					sell_price: 0.4,
				},
			],
		})
	})

	// #52
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'chia' },
			update: {},
			create: {
				id: 'chia',
				coinsListIDMapId: 'chia',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'chia',
					coinId: 'chia',
					coinsListIDMapId: 'chia',
					quantity: 1,
					buy_price: 19.87,
					sell_price: 500,
				},
			],
		})
	})

	// #53
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'ethereum' },
			update: {},
			create: {
				id: 'ethereum',
				coinsListIDMapId: 'ethereum',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'ethereum',
					coinId: 'ethereum',
					coinsListIDMapId: 'ethereum',
					quantity: 0.0483667,
					buy_price: 2747.1,
					sell_price: 5000,
				},
			],
		})
	})

	// #54
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'my-neighbor-alice' },
			update: {},
			create: {
				id: 'my-neighbor-alice',
				coinsListIDMapId: 'my-neighbor-alice',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'my-neighbor-alice',
					coinId: 'my-neighbor-alice',
					coinsListIDMapId: 'my-neighbor-alice',
					quantity: 17,
					buy_price: 0.7088,
					sell_price: 24,
				},
			],
		})
	})

	// #55
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'alpaca-finance' },
			update: {},
			create: {
				id: 'alpaca-finance',
				coinsListIDMapId: 'alpaca-finance',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'alpaca-finance',
					coinId: 'alpaca-finance',
					coinsListIDMapId: 'alpaca-finance',
					quantity: 105,
					buy_price: 0.1174,
					sell_price: 4,
				},
			],
		})
	})

	// #56
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'altlayer' },
			update: {},
			create: {
				id: 'altlayer',
				coinsListIDMapId: 'altlayer',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'altlayer',
					coinId: 'altlayer',
					coinsListIDMapId: 'altlayer',
					quantity: 230,
					buy_price: 0.0531,
					sell_price: 0.7,
				},
			],
		})
	})

	// #57
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'apecoin' },
			update: {},
			create: {
				id: 'apecoin',
				coinsListIDMapId: 'apecoin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'apecoin',
					coinId: 'apecoin',
					coinsListIDMapId: 'apecoin',
					quantity: 32,
					buy_price: 0.6979,
					sell_price: 19,
				},
			],
		})
	})

	// #58
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'bakerytoken' },
			update: {},
			create: {
				id: 'bakerytoken',
				coinsListIDMapId: 'bakerytoken',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'bakerytoken',
					coinId: 'bakerytoken',
					coinsListIDMapId: 'bakerytoken',
					quantity: 85,
					buy_price: 0.1432,
					sell_price: 6.8,
				},
			],
		})
	})

	// #59
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'ethereum-classic' },
			update: {},
			create: {
				id: 'ethereum-classic',
				coinsListIDMapId: 'ethereum-classic',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'ethereum-classic',
					coinId: 'ethereum-classic',
					coinsListIDMapId: 'ethereum-classic',
					quantity: 1,
					buy_price: 20.6871,
					sell_price: 130,
				},
			],
		})
	})

	// #60
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'hashflow' },
			update: {},
			create: {
				id: 'hashflow',
				coinsListIDMapId: 'hashflow',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'hashflow',
					coinId: 'hashflow',
					coinsListIDMapId: 'hashflow',
					quantity: 115,
					buy_price: 0.107,
					sell_price: 1,
				},
			],
		})
	})

	// #61
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'space-id' },
			update: {},
			create: {
				id: 'space-id',
				coinsListIDMapId: 'space-id',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'space-id',
					coinId: 'space-id',
					coinsListIDMapId: 'space-id',
					quantity: 46,
					buy_price: 0.2629,
					sell_price: 1.7,
				},
			],
		})
	})

	// #62
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'litecoin' },
			update: {},
			create: {
				id: 'litecoin',
				coinsListIDMapId: 'litecoin',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'litecoin',
					coinId: 'litecoin',
					coinsListIDMapId: 'litecoin',
					quantity: 0.15,
					buy_price: 107.6833,
					sell_price: 500,
				},
			],
		})
	})

	// #63
	await prisma.$transaction(async (prisma) => {
		await prisma.coin.upsert({
			where: { id: 'starknet' },
			update: {},
			create: {
				id: 'starknet',
				coinsListIDMapId: 'starknet',
			},
		})
		await prisma.userCoin.createMany({
			data: [
				{
					userId,
					id: 'starknet',
					coinId: 'starknet',
					coinsListIDMapId: 'starknet',
					quantity: 48,
					buy_price: 0.2523,
					sell_price: 2.7,
				},
			],
		})
	})
}

async function down() {
	// await prisma.$executeRaw`DELETE FROM "user_coin" CASCADE;`
	// await prisma.$executeRaw`TRUNCATE TABLE "user_coin" RESTART IDENTITY CASCADE;`
}

async function main() {
	try {
		await down()
		await up()
	} catch (e) {
		console.error(e)
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
