import { prisma } from './../src/lib/prisma'
import { updateCoinsListIDMapFromAPI } from './../src/app/api/actions'

async function up() {
	// ID пользователя
	const userId = 'cm6o17y980000470yy9lsjkd9'

	// Запускает обновление списка криптовалют ~20мин
	await updateCoinsListIDMapFromAPI()

	// Создаем запись в Coin
	await prisma.coin.upsert({
		where: { id: '1inch' },
		update: {},
		create: {
			id: '1inch',
			coinsListIDMapId: '1inch',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'aave' },
		update: {},
		create: {
			id: 'aave',
			coinsListIDMapId: 'aave',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'algorand' },
		update: {},
		create: {
			id: 'algorand',
			coinsListIDMapId: 'algorand',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'cosmos' },
		update: {},
		create: {
			id: 'cosmos',
			coinsListIDMapId: 'cosmos',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'avalanche-2' },
		update: {},
		create: {
			id: 'avalanche-2',
			coinsListIDMapId: 'avalanche-2',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'basic-attention-token' },
		update: {},
		create: {
			id: 'basic-attention-token',
			coinsListIDMapId: 'basic-attention-token',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'bitcoin' },
		update: {},
		create: {
			id: 'bitcoin',
			coinsListIDMapId: 'bitcoin',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'pancakeswap-token' },
		update: {},
		create: {
			id: 'pancakeswap-token',
			coinsListIDMapId: 'pancakeswap-token',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'celo' },
		update: {},
		create: {
			id: 'celo',
			coinsListIDMapId: 'celo',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'celer-network' },
		update: {},
		create: {
			id: 'celer-network',
			coinsListIDMapId: 'celer-network',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'coin98' },
		update: {},
		create: {
			id: 'coin98',
			coinsListIDMapId: 'coin98',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'crypto-com-chain' },
		update: {},
		create: {
			id: 'crypto-com-chain',
			coinsListIDMapId: 'crypto-com-chain',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'dash' },
		update: {},
		create: {
			id: 'dash',
			coinsListIDMapId: 'dash',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'dogecoin' },
		update: {},
		create: {
			id: 'dogecoin',
			coinsListIDMapId: 'dogecoin',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'polkadot' },
		update: {},
		create: {
			id: 'polkadot',
			coinsListIDMapId: 'polkadot',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'elrond-erd-2' },
		update: {},
		create: {
			id: 'elrond-erd-2',
			coinsListIDMapId: 'elrond-erd-2',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'eos' },
		update: {},
		create: {
			id: 'eos',
			coinsListIDMapId: 'eos',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'flow' },
		update: {},
		create: {
			id: 'flow',
			coinsListIDMapId: 'flow',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'moonbeam' },
		update: {},
		create: {
			id: 'moonbeam',
			coinsListIDMapId: 'moonbeam',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'hedera-hashgraph' },
		update: {},
		create: {
			id: 'hedera-hashgraph',
			coinsListIDMapId: 'hedera-hashgraph',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'internet-computer' },
		update: {},
		create: {
			id: 'internet-computer',
			coinsListIDMapId: 'internet-computer',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'iota' },
		update: {},
		create: {
			id: 'iota',
			coinsListIDMapId: 'iota',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'kusama' },
		update: {},
		create: {
			id: 'kusama',
			coinsListIDMapId: 'kusama',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'loopring' },
		update: {},
		create: {
			id: 'loopring',
			coinsListIDMapId: 'loopring',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'chainlink' },
		update: {},
		create: {
			id: 'chainlink',
			coinsListIDMapId: 'chainlink',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'decentraland' },
		update: {},
		create: {
			id: 'decentraland',
			coinsListIDMapId: 'decentraland',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'maker' },
		update: {},
		create: {
			id: 'maker',
			coinsListIDMapId: 'maker',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'near' },
		update: {},
		create: {
			id: 'near',
			coinsListIDMapId: 'near',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'neo' },
		update: {},
		create: {
			id: 'neo',
			coinsListIDMapId: 'neo',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'qtum' },
		update: {},
		create: {
			id: 'qtum',
			coinsListIDMapId: 'qtum',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'reef' },
		update: {},
		create: {
			id: 'reef',
			coinsListIDMapId: 'reef',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'shiba-inu' },
		update: {},
		create: {
			id: 'shiba-inu',
			coinsListIDMapId: 'shiba-inu',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'sonic-3' },
		update: {},
		create: {
			id: 'sonic-3',
			coinsListIDMapId: 'sonic-3',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'sushi' },
		update: {},
		create: {
			id: 'sushi',
			coinsListIDMapId: 'sushi',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'tether' },
		update: {},
		create: {
			id: 'tether',
			coinsListIDMapId: 'tether',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'the-sandbox' },
		update: {},
		create: {
			id: 'the-sandbox',
			coinsListIDMapId: 'the-sandbox',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'trust-wallet-token' },
		update: {},
		create: {
			id: 'trust-wallet-token',
			coinsListIDMapId: 'trust-wallet-token',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'uniswap' },
		update: {},
		create: {
			id: 'uniswap',
			coinsListIDMapId: 'uniswap',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'vechain' },
		update: {},
		create: {
			id: 'vechain',
			coinsListIDMapId: 'vechain',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'woo-network' },
		update: {},
		create: {
			id: 'woo-network',
			coinsListIDMapId: 'woo-network',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'nem' },
		update: {},
		create: {
			id: 'nem',
			coinsListIDMapId: 'nem',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'tezos' },
		update: {},
		create: {
			id: 'tezos',
			coinsListIDMapId: 'tezos',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'zilliqa' },
		update: {},
		create: {
			id: 'zilliqa',
			coinsListIDMapId: 'zilliqa',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'usd-coin' },
		update: {},
		create: {
			id: 'usd-coin',
			coinsListIDMapId: 'usd-coin',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'derive' },
		update: {},
		create: {
			id: 'derive',
			coinsListIDMapId: 'derive',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'sosovalue' },
		update: {},
		create: {
			id: 'sosovalue',
			coinsListIDMapId: 'sosovalue',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'aptos' },
		update: {},
		create: {
			id: 'aptos',
			coinsListIDMapId: 'aptos',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'ondo-finance' },
		update: {},
		create: {
			id: 'ondo-finance',
			coinsListIDMapId: 'ondo-finance',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'cardano' },
		update: {},
		create: {
			id: 'cardano',
			coinsListIDMapId: 'cardano',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'rowan-coin' },
		update: {},
		create: {
			id: 'rowan-coin',
			coinsListIDMapId: 'rowan-coin',
		},
	})

	await prisma.coin.upsert({
		where: { id: 'chia' },
		update: {},
		create: {
			id: 'chia',
			coinsListIDMapId: 'chia',
		},
	})

	// Создаем запись в UserCoin
	await prisma.userCoin.createMany({
		data: [
			{ userId, id: '1inch', coinId: '1inch', coinsListIDMapId: '1inch', quantity: 20 },
			{ userId, id: 'aave', coinId: 'aave', coinsListIDMapId: 'aave', quantity: 0.2 },
			{ userId, id: 'algorand', coinId: 'algorand', coinsListIDMapId: 'algorand', quantity: 130.10011 },
			{ userId, id: 'cosmos', coinId: 'cosmos', coinsListIDMapId: 'cosmos', quantity: 4.684885 },
			{ userId, id: 'avalanche-2', coinId: 'avalanche-2', coinsListIDMapId: 'avalanche-2', quantity: 1 },
			{
				userId,
				id: 'basic-attention-token',
				coinId: 'basic-attention-token',
				coinsListIDMapId: 'basic-attention-token',
				quantity: 60,
			},
			{ userId, id: 'bitcoin', coinId: 'bitcoin', coinsListIDMapId: 'bitcoin', quantity: 0.00963772 },
			{
				userId,
				id: 'pancakeswap-token',
				coinId: 'pancakeswap-token',
				coinsListIDMapId: 'pancakeswap-token',
				quantity: 7,
			},
			{ userId, id: 'celo', coinId: 'celo', coinsListIDMapId: 'celo', quantity: 15 },
			{
				userId,
				id: 'celer-network',
				coinId: 'celer-network',
				coinsListIDMapId: 'celer-network',
				quantity: 350,
			},
			{ userId, id: 'coin98', coinId: 'coin98', coinsListIDMapId: 'coin98', quantity: 40 },
			{
				userId,
				id: 'crypto-com-chain',
				coinId: 'crypto-com-chain',
				coinsListIDMapId: 'crypto-com-chain',
				quantity: 150,
			},
			{ userId, id: 'dash', coinId: 'dash', coinsListIDMapId: 'dash', quantity: 0.3 },
			{ userId, id: 'dogecoin', coinId: 'dogecoin', coinsListIDMapId: 'dogecoin', quantity: 300 },
			{ userId, id: 'polkadot', coinId: 'polkadot', coinsListIDMapId: 'polkadot', quantity: 10 },
			{
				userId,
				id: 'elrond-erd-2',
				coinId: 'elrond-erd-2',
				coinsListIDMapId: 'elrond-erd-2',
				quantity: 1.2205455,
			},
			{ userId, id: 'eos', coinId: 'eos', coinsListIDMapId: 'eos', quantity: 11 },
			{ userId, id: 'filecoin', coinId: 'filecoin', coinsListIDMapId: 'filecoin', quantity: 1.2486047 },
			{ userId, id: 'flow', coinId: 'flow', coinsListIDMapId: 'flow', quantity: 13 },
			{ userId, id: 'moonbeam', coinId: 'moonbeam', coinsListIDMapId: 'moonbeam', quantity: 50 },
			{
				userId,
				id: 'hedera-hashgraph',
				coinId: 'hedera-hashgraph',
				coinsListIDMapId: 'hedera-hashgraph',
				quantity: 200,
			},
			{
				userId,
				id: 'internet-computer',
				coinId: 'internet-computer',
				coinsListIDMapId: 'internet-computer',
				quantity: 2,
			},
			{ userId, id: 'iota', coinId: 'iota', coinsListIDMapId: 'iota', quantity: 110 },
			{ userId, id: 'kusama', coinId: 'kusama', coinsListIDMapId: 'kusama', quantity: 0.25 },
			{ userId, id: 'loopring', coinId: 'loopring', coinsListIDMapId: 'loopring', quantity: 40 },
			{ userId, id: 'chainlink', coinId: 'chainlink', coinsListIDMapId: 'chainlink', quantity: 1.5 },
			{
				userId,
				id: 'decentraland',
				coinId: 'decentraland',
				coinsListIDMapId: 'decentraland',
				quantity: 25,
			},
			{ userId, id: 'maker', coinId: 'maker', coinsListIDMapId: 'maker', quantity: 0.015 },
			{ userId, id: 'near', coinId: 'near', coinsListIDMapId: 'near', quantity: 7.1920949 },
			{ userId, id: 'neo', coinId: 'neo', coinsListIDMapId: 'neo', quantity: 2 },
			{ userId, id: 'qtum', coinId: 'qtum', coinsListIDMapId: 'qtum', quantity: 4 },
			{ userId, id: 'reef', coinId: 'reef', coinsListIDMapId: 'reef', quantity: 3600 },
			{ userId, id: 'shiba-inu', coinId: 'shiba-inu', coinsListIDMapId: 'shiba-inu', quantity: 1300000 },
			{ userId, id: 'sonic-3', coinId: 'sonic-3', coinsListIDMapId: 'sonic-3', quantity: 50 },
			{ userId, id: 'sushi', coinId: 'sushi', coinsListIDMapId: 'sushi', quantity: 10 },
			{ userId, id: 'tether', coinId: 'tether', coinsListIDMapId: 'tether', quantity: 991.76502992 },
			{
				userId,
				id: 'the-sandbox',
				coinId: 'the-sandbox',
				coinsListIDMapId: 'the-sandbox',
				quantity: 12.66511,
			},
			{
				userId,
				id: 'trust-wallet-token',
				coinId: 'trust-wallet-token',
				coinsListIDMapId: 'trust-wallet-token',
				quantity: 15,
			},
			{ userId, id: 'uniswap', coinId: 'uniswap', coinsListIDMapId: 'uniswap', quantity: 2 },
			{ userId, id: 'vechain', coinId: 'vechain', coinsListIDMapId: 'vechain', quantity: 500 },
			{ userId, id: 'woo-network', coinId: 'woo-network', coinsListIDMapId: 'woo-network', quantity: 50 },
			{ userId, id: 'nem', coinId: 'nem', coinsListIDMapId: 'nem', quantity: 250 },
			{ userId, id: 'tezos', coinId: 'tezos', coinsListIDMapId: 'tezos', quantity: 21.869092 },
			{ userId, id: 'zilliqa', coinId: 'zilliqa', coinsListIDMapId: 'zilliqa', quantity: 400 },
			{ userId, id: 'usd-coin', coinId: 'usd-coin', coinsListIDMapId: 'usd-coin', quantity: 1.4306788 },
			{ userId, id: 'derive', coinId: 'derive', coinsListIDMapId: 'derive', quantity: 101.167327 },
			{ userId, id: 'sosovalue', coinId: 'sosovalue', coinsListIDMapId: 'sosovalue', quantity: 53.49 },
			{ userId, id: 'aptos', coinId: 'aptos', coinsListIDMapId: 'aptos', quantity: 3.00585339 },
			{
				userId,
				id: 'ondo-finance',
				coinId: 'ondo-finance',
				coinsListIDMapId: 'ondo-finance',
				quantity: 15,
			},
			{ userId, id: 'cardano', coinId: 'cardano', coinsListIDMapId: 'cardano', quantity: 20 },
			{ userId, id: 'rowan-coin', coinId: 'rowan-coin', coinsListIDMapId: 'rowan-coin', quantity: 2000 },
			{ userId, id: 'chia', coinId: 'chia', coinsListIDMapId: 'chia', quantity: 1 },
		],
	})
}

async function down() {
	await prisma.$executeRaw`DELETE FROM "user_coin" CASCADE;`
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
