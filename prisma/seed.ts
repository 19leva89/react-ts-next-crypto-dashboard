import { prisma } from './../src/lib/prisma'

async function up() {
	// ID пользователя
	const userId = 'cm6o17y980000470yy9lsjkd9'

	// Создаем UserCoin
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
			{ userId, id: 'decentraland', coinId: 'decentraland', coinsListIDMapId: 'decentraland', quantity: 25 },
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
			{ userId, id: 'ondo-finance', coinId: 'ondo-finance', coinsListIDMapId: 'ondo-finance', quantity: 15 },
			{ userId, id: 'cardano', coinId: 'cardano', coinsListIDMapId: 'cardano', quantity: 20 },
			{ userId, id: 'rowan-coin', coinId: 'rowan-coin', coinsListIDMapId: 'rowan-coin', quantity: 2000 },
			{ userId, id: 'chia', coinId: 'chia', coinsListIDMapId: 'chia', quantity: 1 },
		],
	})
}

async function down() {
	await prisma.$executeRaw`DELETE FROM "user_coin" CASCADE;`
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
