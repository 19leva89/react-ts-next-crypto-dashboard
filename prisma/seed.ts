// Do not change the path, made for seed.ts
import {
	deleteNonExistentCoinsListIDMap,
	getCoinsList,
	updateCoinsListIDMapFromAPI,
	updateCoinsListIDMapImageFromAPI,
} from './../src/actions/actions-seed'
import { prisma } from './../src/lib/prisma'

//! To run the command "npx prisma db seed" the server must be running

// User ID
// export const userId = 'cm736nm3z0000o80c4valc9jp'

async function up() {
	// Updating the list of cryptocurrencies ~20min
	// await updateCoinsListIDMapFromAPI()

	// Updating the list of cryptocurrencies with images ~20min
	// await updateCoinsListIDMapImageFromAPI()

	// Delete non existent cryptocurrencies
	await deleteNonExistentCoinsListIDMap()

	// Get a list of cryptocurrencies TOP250
	// await getCoinsList()

	// Create a record in Coin and UserCoin
	// #1 1INCH
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: '1inch' },
	// 		update: {},
	// 		create: {
	// 			id: '1inch',
	// 			coinsListIDMapId: '1inch',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: '1inch',
	// 			coinId: '1inch',
	// 			coinsListIDMapId: '1inch',
	// 			total_quantity: 20,
	// 			total_cost: 11.08,
	// 			average_price: 0.55394165,
	// 			desired_sell_price: 7.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: '1inch',
	// 				quantity: 20,
	// 				price: 0.55394165,
	// 				date: new Date('2023-02-02T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #2 AAVE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'aave' },
	// 		update: {},
	// 		create: {
	// 			id: 'aave',
	// 			coinsListIDMapId: 'aave',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'aave',
	// 			coinId: 'aave',
	// 			coinsListIDMapId: 'aave',
	// 			total_quantity: 0.2,
	// 			total_cost: 13.21,
	// 			average_price: 66.07,
	// 			desired_sell_price: 520,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'aave',
	// 				quantity: 0.2,
	// 				price: 66.07,
	// 				date: new Date('2023-08-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #3 ADA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'cardano' },
	// 		update: {},
	// 		create: {
	// 			id: 'cardano',
	// 			coinsListIDMapId: 'cardano',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'cardano',
	// 			coinId: 'cardano',
	// 			coinsListIDMapId: 'cardano',
	// 			total_quantity: 20,
	// 			total_cost: 19.78,
	// 			average_price: 0.989,
	// 			desired_sell_price: 3,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'cardano',
	// 				quantity: 20,
	// 				price: 0.989,
	// 				date: new Date('2025-01-22T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #4 AEVO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'aevo-exchange' },
	// 		update: {},
	// 		create: {
	// 			id: 'aevo-exchange',
	// 			coinsListIDMapId: 'aevo-exchange',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'aevo-exchange',
	// 			coinId: 'aevo-exchange',
	// 			coinsListIDMapId: 'aevo-exchange',
	// 			total_quantity: 60,
	// 			total_cost: 10.13,
	// 			average_price: 0.168783,
	// 			desired_sell_price: 3.2,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'aevo-exchange',
	// 				quantity: 60,
	// 				price: 0.168783,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #5 ALGO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'algorand' },
	// 		update: {},
	// 		create: {
	// 			id: 'algorand',
	// 			coinsListIDMapId: 'algorand',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'algorand',
	// 			coinId: 'algorand',
	// 			coinsListIDMapId: 'algorand',
	// 			total_quantity: 130.10011,
	// 			total_cost: 26.17,
	// 			average_price: 0.2011,
	// 			desired_sell_price: 2.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 6.05012891,
	// 				price: 0.224456,
	// 				date: new Date('2022-12-08T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 41.55678768,
	// 				price: 0.224457,
	// 				date: new Date('2022-12-08T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 3.96826089,
	// 				price: 0.224457,
	// 				date: new Date('2022-12-09T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 48.13482252,
	// 				price: 0.163347,
	// 				date: new Date('2022-12-28T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 15.29,
	// 				price: 0.184469,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 15,
	// 				price: 0.260368,
	// 				date: new Date('2023-01-30T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'algorand',
	// 				quantity: 0.10011,
	// 				price: 0,
	// 				date: new Date('2023-02-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #6 ALICE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'my-neighbor-alice' },
	// 		update: {},
	// 		create: {
	// 			id: 'my-neighbor-alice',
	// 			coinsListIDMapId: 'my-neighbor-alice',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'my-neighbor-alice',
	// 			coinId: 'my-neighbor-alice',
	// 			coinsListIDMapId: 'my-neighbor-alice',
	// 			total_quantity: 17,
	// 			total_cost: 12.05,
	// 			average_price: 0.7088,
	// 			desired_sell_price: 24,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'my-neighbor-alice',
	// 				quantity: 17,
	// 				price: 0.7088,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #7 ALPACA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'alpaca-finance' },
	// 		update: {},
	// 		create: {
	// 			id: 'alpaca-finance',
	// 			coinsListIDMapId: 'alpaca-finance',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'alpaca-finance',
	// 			coinId: 'alpaca-finance',
	// 			coinsListIDMapId: 'alpaca-finance',
	// 			total_quantity: 105,
	// 			total_cost: 12.32,
	// 			average_price: 0.1174,
	// 			desired_sell_price: 4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'alpaca-finance',
	// 				quantity: 105,
	// 				price: 0.1174,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #8 ALT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'altlayer' },
	// 		update: {},
	// 		create: {
	// 			id: 'altlayer',
	// 			coinsListIDMapId: 'altlayer',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'altlayer',
	// 			coinId: 'altlayer',
	// 			coinsListIDMapId: 'altlayer',
	// 			total_quantity: 230,
	// 			total_cost: 12.21,
	// 			average_price: 0.0531,
	// 			desired_sell_price: 0.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'altlayer',
	// 				quantity: 230,
	// 				price: 0.0531,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #9 APE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'apecoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'apecoin',
	// 			coinsListIDMapId: 'apecoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'apecoin',
	// 			coinId: 'apecoin',
	// 			coinsListIDMapId: 'apecoin',
	// 			total_quantity: 32,
	// 			total_cost: 22.33,
	// 			average_price: 0.6979,
	// 			desired_sell_price: 19,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'apecoin',
	// 				quantity: 32,
	// 				price: 0.6979,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #10 APT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'aptos' },
	// 		update: {},
	// 		create: {
	// 			id: 'aptos',
	// 			coinsListIDMapId: 'aptos',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'aptos',
	// 			coinId: 'aptos',
	// 			coinsListIDMapId: 'aptos',
	// 			total_quantity: 3.00585339,
	// 			total_cost: 20.14,
	// 			average_price: 6.7,
	// 			desired_sell_price: 25,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'aptos',
	// 				quantity: 3.00585339,
	// 				price: 6.7,
	// 				date: new Date('2025-01-25T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #11 ARB
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'arbitrum' },
	// 		update: {},
	// 		create: {
	// 			id: 'arbitrum',
	// 			coinsListIDMapId: 'arbitrum',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'arbitrum',
	// 			coinId: 'arbitrum',
	// 			coinsListIDMapId: 'arbitrum',
	// 			total_quantity: 20,
	// 			total_cost: 9.86,
	// 			average_price: 0.493142,
	// 			desired_sell_price: 2.3,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'arbitrum',
	// 				quantity: 20,
	// 				price: 0.493142,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #12 ATOM
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'cosmos' },
	// 		update: {},
	// 		create: {
	// 			id: 'cosmos',
	// 			coinsListIDMapId: 'cosmos',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'cosmos',
	// 			coinId: 'cosmos',
	// 			coinsListIDMapId: 'cosmos',
	// 			total_quantity: 4.68489,
	// 			total_cost: 26.59,
	// 			average_price: 5.676,
	// 			desired_sell_price: 50,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'cosmos',
	// 				quantity: 3.0,
	// 				price: 7.13,
	// 				date: new Date('2023-09-22T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'cosmos',
	// 				quantity: 0.54389,
	// 				price: 0,
	// 				date: new Date('2024-10-01T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'cosmos',
	// 				quantity: 1.141,
	// 				price: 4.51,
	// 				date: new Date('2024-11-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #13 AURORA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'aurora-near' },
	// 		update: {},
	// 		create: {
	// 			id: 'aurora-near',
	// 			coinsListIDMapId: 'aurora-near',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'aurora-near',
	// 			coinId: 'aurora-near',
	// 			coinsListIDMapId: 'aurora-near',
	// 			total_quantity: 65,
	// 			total_cost: 10.06,
	// 			average_price: 0.15469415,
	// 			desired_sell_price: 3.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'aurora-near',
	// 				quantity: 65,
	// 				price: 0.15469415,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #14 AVAX
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'avalanche-2' },
	// 		update: {},
	// 		create: {
	// 			id: 'avalanche-2',
	// 			coinsListIDMapId: 'avalanche-2',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'avalanche-2',
	// 			coinId: 'avalanche-2',
	// 			coinsListIDMapId: 'avalanche-2',
	// 			total_quantity: 1,
	// 			total_cost: 14.95,
	// 			average_price: 14.951,
	// 			desired_sell_price: 125,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'avalanche-2',
	// 				quantity: 1,
	// 				price: 14.951,
	// 				date: new Date('2023-05-29T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #15 BAKE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'bakerytoken' },
	// 		update: {},
	// 		create: {
	// 			id: 'bakerytoken',
	// 			coinsListIDMapId: 'bakerytoken',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'bakerytoken',
	// 			coinId: 'bakerytoken',
	// 			coinsListIDMapId: 'bakerytoken',
	// 			total_quantity: 85,
	// 			total_cost: 12.17,
	// 			average_price: 0.1432,
	// 			desired_sell_price: 6.8,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'bakerytoken',
	// 				quantity: 85,
	// 				price: 0.1432,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #16 BAT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'basic-attention-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'basic-attention-token',
	// 			coinsListIDMapId: 'basic-attention-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'basic-attention-token',
	// 			coinId: 'basic-attention-token',
	// 			coinsListIDMapId: 'basic-attention-token',
	// 			total_quantity: 60,
	// 			total_cost: 10.29,
	// 			average_price: 0.171502,
	// 			desired_sell_price: 1.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'basic-attention-token',
	// 				quantity: 60,
	// 				price: 0.171502,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #17 BICO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'biconomy' },
	// 		update: {},
	// 		create: {
	// 			id: 'biconomy',
	// 			coinsListIDMapId: 'biconomy',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'biconomy',
	// 			coinId: 'biconomy',
	// 			coinsListIDMapId: 'biconomy',
	// 			total_quantity: 55,
	// 			total_cost: 10.29,
	// 			average_price: 0.187022,
	// 			desired_sell_price: 13,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'biconomy',
	// 				quantity: 55,
	// 				price: 0.187022,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #18 BLUR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'blur' },
	// 		update: {},
	// 		create: {
	// 			id: 'blur',
	// 			coinsListIDMapId: 'blur',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'blur',
	// 			coinId: 'blur',
	// 			coinsListIDMapId: 'blur',
	// 			total_quantity: 70,
	// 			total_cost: 10.23,
	// 			average_price: 0.146165,
	// 			desired_sell_price: 5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'blur',
	// 				quantity: 70,
	// 				price: 0.146165,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #19 BTC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'bitcoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'bitcoin',
	// 			coinsListIDMapId: 'bitcoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'bitcoin',
	// 			coinId: 'bitcoin',
	// 			coinsListIDMapId: 'bitcoin',
	// 			total_quantity: 0.009639,
	// 			total_cost: 322.13,
	// 			average_price: 33419.47,
	// 			desired_sell_price: 120000,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00052359,
	// 				price: 21846,
	// 				date: new Date('2023-02-13T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00047652,
	// 				price: 25518,
	// 				date: new Date('2023-03-27T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.01142062,
	// 				price: 26459,
	// 				date: new Date('2023-05-25T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00183563,
	// 				price: 43597,
	// 				date: new Date('2023-12-07T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.001312,
	// 				price: 42210,
	// 				date: new Date('2024-01-01T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.0009907,
	// 				price: 42600,
	// 				date: new Date('2024-02-04T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00073186,
	// 				price: 61270,
	// 				date: new Date('2024-03-05T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00076822,
	// 				price: 63682,
	// 				date: new Date('2024-05-07T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00063345,
	// 				price: 73686,
	// 				date: new Date('2024-11-06T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: -0.00934,
	// 				price: 106966,
	// 				date: new Date('2024-12-17T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'bitcoin',
	// 				quantity: 0.00028641,
	// 				price: 0,
	// 				date: new Date('2024-12-28T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #20 CAKE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'pancakeswap-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'pancakeswap-token',
	// 			coinsListIDMapId: 'pancakeswap-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'pancakeswap-token',
	// 			coinId: 'pancakeswap-token',
	// 			coinsListIDMapId: 'pancakeswap-token',
	// 			total_quantity: 7,
	// 			total_cost: 10.5,
	// 			average_price: 1.5,
	// 			desired_sell_price: 40,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'pancakeswap-token',
	// 				quantity: 7,
	// 				price: 1.5,
	// 				date: new Date('2023-08-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #21 CELO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'celo' },
	// 		update: {},
	// 		create: {
	// 			id: 'celo',
	// 			coinsListIDMapId: 'celo',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'celo',
	// 			coinId: 'celo',
	// 			coinsListIDMapId: 'celo',
	// 			total_quantity: 15,
	// 			total_cost: 9.53,
	// 			average_price: 0.635,
	// 			desired_sell_price: 7.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'celo',
	// 				quantity: 15,
	// 				price: 0.635,
	// 				date: new Date('2024-11-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #22 CELR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'celer-network' },
	// 		update: {},
	// 		create: {
	// 			id: 'celer-network',
	// 			coinsListIDMapId: 'celer-network',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'celer-network',
	// 			coinId: 'celer-network',
	// 			coinsListIDMapId: 'celer-network',
	// 			total_quantity: 350,
	// 			total_cost: 10.35,
	// 			average_price: 0.02956,
	// 			desired_sell_price: 0.15,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'celer-network',
	// 				quantity: 350,
	// 				price: 0.02956,
	// 				date: new Date('2024-12-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #23 CHZ
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'chiliz' },
	// 		update: {},
	// 		create: {
	// 			id: 'chiliz',
	// 			coinsListIDMapId: 'chiliz',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'chiliz',
	// 			coinId: 'chiliz',
	// 			coinsListIDMapId: 'chiliz',
	// 			total_quantity: 160,
	// 			total_cost: 9.98,
	// 			average_price: 0.0623542,
	// 			desired_sell_price: 0.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'chiliz',
	// 				quantity: 160,
	// 				price: 0.0623542,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #24 C98
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'coin98' },
	// 		update: {},
	// 		create: {
	// 			id: 'coin98',
	// 			coinsListIDMapId: 'coin98',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'coin98',
	// 			coinId: 'coin98',
	// 			coinsListIDMapId: 'coin98',
	// 			total_quantity: 40,
	// 			total_cost: 11.83,
	// 			average_price: 0.29567,
	// 			desired_sell_price: 5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'coin98',
	// 				quantity: 40,
	// 				price: 0.29567,
	// 				date: new Date('2024-12-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #25 CRO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'crypto-com-chain' },
	// 		update: {},
	// 		create: {
	// 			id: 'crypto-com-chain',
	// 			coinsListIDMapId: 'crypto-com-chain',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'crypto-com-chain',
	// 			coinId: 'crypto-com-chain',
	// 			coinsListIDMapId: 'crypto-com-chain',
	// 			total_quantity: 150,
	// 			total_cost: 8.87,
	// 			average_price: 0.05916,
	// 			desired_sell_price: 0.8,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'crypto-com-chain',
	// 				quantity: 150,
	// 				price: 0.05916,
	// 				date: new Date('2023-07-27T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #26 CRV
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'curve-dao-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'curve-dao-token',
	// 			coinsListIDMapId: 'curve-dao-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'curve-dao-token',
	// 			coinId: 'curve-dao-token',
	// 			coinsListIDMapId: 'curve-dao-token',
	// 			total_quantity: 17,
	// 			total_cost: 10.19,
	// 			average_price: 0.59957,
	// 			desired_sell_price: 11.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'curve-dao-token',
	// 				quantity: 17,
	// 				price: 0.59957,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #27 CSPR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'casper-network' },
	// 		update: {},
	// 		create: {
	// 			id: 'casper-network',
	// 			coinsListIDMapId: 'casper-network',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'casper-network',
	// 			coinId: 'casper-network',
	// 			coinsListIDMapId: 'casper-network',
	// 			total_quantity: 800,
	// 			total_cost: 10.23,
	// 			average_price: 0.01279,
	// 			desired_sell_price: 1.3,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'casper-network',
	// 				quantity: 800,
	// 				price: 0.01279,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #28 CYBER
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'cyberconnect' },
	// 		update: {},
	// 		create: {
	// 			id: 'cyberconnect',
	// 			coinsListIDMapId: 'cyberconnect',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'cyberconnect',
	// 			coinId: 'cyberconnect',
	// 			coinsListIDMapId: 'cyberconnect',
	// 			total_quantity: 5,
	// 			total_cost: 9.66,
	// 			average_price: 1.93107,
	// 			desired_sell_price: 14,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'cyberconnect',
	// 				quantity: 5,
	// 				price: 1.93107,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #29 DAO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'dao-maker' },
	// 		update: {},
	// 		create: {
	// 			id: 'dao-maker',
	// 			coinsListIDMapId: 'dao-maker',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'dao-maker',
	// 			coinId: 'dao-maker',
	// 			coinsListIDMapId: 'dao-maker',
	// 			total_quantity: 40,
	// 			total_cost: 10.68,
	// 			average_price: 0.26706452,
	// 			desired_sell_price: 8.12,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'dao-maker',
	// 				quantity: 40,
	// 				price: 0.26706452,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #30 DASH
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'dash' },
	// 		update: {},
	// 		create: {
	// 			id: 'dash',
	// 			coinsListIDMapId: 'dash',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'dash',
	// 			coinId: 'dash',
	// 			coinsListIDMapId: 'dash',
	// 			total_quantity: 0.3,
	// 			total_cost: 13.83,
	// 			average_price: 46.0909,
	// 			desired_sell_price: 450,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'dash',
	// 				quantity: 0.3,
	// 				price: 46.0909,
	// 				date: new Date('2023-03-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #31 DMAIL
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'dmail-network' },
	// 		update: {},
	// 		create: {
	// 			id: 'dmail-network',
	// 			coinsListIDMapId: 'dmail-network',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'dmail-network',
	// 			coinId: 'dmail-network',
	// 			coinsListIDMapId: 'dmail-network',
	// 			total_quantity: 80,
	// 			total_cost: 10.25,
	// 			average_price: 0.12808388,
	// 			desired_sell_price: 1,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'dmail-network',
	// 				quantity: 80,
	// 				price: 0.12808388,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #32 DOGE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'dogecoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'dogecoin',
	// 			coinsListIDMapId: 'dogecoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'dogecoin',
	// 			coinId: 'dogecoin',
	// 			coinsListIDMapId: 'dogecoin',
	// 			total_quantity: 300,
	// 			total_cost: 52.13,
	// 			average_price: 0.1685133333,
	// 			desired_sell_price: 0.6,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'dogecoin',
	// 				quantity: 200,
	// 				price: 0.05907,
	// 				date: new Date('2023-10-10T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'dogecoin',
	// 				quantity: 100,
	// 				price: 0.3874,
	// 				date: new Date('2025-01-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #33 DOT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'polkadot' },
	// 		update: {},
	// 		create: {
	// 			id: 'polkadot',
	// 			coinsListIDMapId: 'polkadot',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'polkadot',
	// 			coinId: 'polkadot',
	// 			coinsListIDMapId: 'polkadot',
	// 			total_quantity: 10,
	// 			total_cost: 65.13,
	// 			average_price: 6.29,
	// 			desired_sell_price: 50,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 1.67330592,
	// 				price: 5.70346,
	// 				date: new Date('2022-12-05T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 0.00159408,
	// 				price: 0,
	// 				date: new Date('2023-01-05T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 2.4251,
	// 				price: 5.08287,
	// 				date: new Date('2023-01-12T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 1.9,
	// 				price: 5.85,
	// 				date: new Date('2023-05-01T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 0.09,
	// 				price: 0,
	// 				date: new Date('2024-12-25T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'polkadot',
	// 				quantity: 3.91,
	// 				price: 7.64,
	// 				date: new Date('2025-01-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #34 DRV
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'derive' },
	// 		update: {},
	// 		create: {
	// 			id: 'derive',
	// 			coinsListIDMapId: 'derive',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'derive',
	// 			coinId: 'derive',
	// 			coinsListIDMapId: 'derive',
	// 			total_quantity: 102.00499377,
	// 			total_cost: 10.17,
	// 			average_price: 0.1,
	// 			desired_sell_price: 1,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'derive',
	// 				quantity: 102.00499377,
	// 				price: 0.1,
	// 				date: new Date('2025-01-25T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #35 DYDX
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'dydx-chain' },
	// 		update: {},
	// 		create: {
	// 			id: 'dydx-chain',
	// 			coinsListIDMapId: 'dydx-chain',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'dydx-chain',
	// 			coinId: 'dydx-chain',
	// 			coinsListIDMapId: 'dydx-chain',
	// 			total_quantity: 13,
	// 			total_cost: 10.38,
	// 			average_price: 0.798837,
	// 			desired_sell_price: 4.37,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'dydx-chain',
	// 				quantity: 13,
	// 				price: 0.798837,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #36 EGLD
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'elrond-erd-2' },
	// 		update: {},
	// 		create: {
	// 			id: 'elrond-erd-2',
	// 			coinsListIDMapId: 'elrond-erd-2',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'elrond-erd-2',
	// 			coinId: 'elrond-erd-2',
	// 			coinsListIDMapId: 'elrond-erd-2',
	// 			total_quantity: 1.2205455,
	// 			total_cost: 33.12,
	// 			average_price: 27.1,
	// 			desired_sell_price: 450,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'elrond-erd-2',
	// 				quantity: 0.5,
	// 				price: 30.14,
	// 				date: new Date('2023-06-20T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'elrond-erd-2',
	// 				quantity: 0.6991886,
	// 				price: 25.75,
	// 				date: new Date('2024-11-07T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'elrond-erd-2',
	// 				quantity: 0.0213569,
	// 				price: 0,
	// 				date: new Date('2025-01-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #37 EOS
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'eos' },
	// 		update: {},
	// 		create: {
	// 			id: 'eos',
	// 			coinsListIDMapId: 'eos',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'eos',
	// 			coinId: 'eos',
	// 			coinsListIDMapId: 'eos',
	// 			total_quantity: 11,
	// 			total_cost: 14.84,
	// 			average_price: 1.348946,
	// 			desired_sell_price: 14.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'eos',
	// 				quantity: 11,
	// 				price: 1.348946,
	// 				date: new Date('2023-04-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #38 ESE
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'eesee' },
	// 		update: {},
	// 		create: {
	// 			id: 'eesee',
	// 			coinsListIDMapId: 'eesee',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'eesee',
	// 			coinId: 'eesee',
	// 			coinsListIDMapId: 'eesee',
	// 			total_quantity: 500,
	// 			total_cost: 9.38,
	// 			average_price: 0.01875354,
	// 			desired_sell_price: 0.15,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'eesee',
	// 				quantity: 500,
	// 				price: 0.01875354,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #39 ETC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'ethereum-classic' },
	// 		update: {},
	// 		create: {
	// 			id: 'ethereum-classic',
	// 			coinsListIDMapId: 'ethereum-classic',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'ethereum-classic',
	// 			coinId: 'ethereum-classic',
	// 			coinsListIDMapId: 'ethereum-classic',
	// 			total_quantity: 1,
	// 			total_cost: 20.69,
	// 			average_price: 20.6871,
	// 			desired_sell_price: 130,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'ethereum-classic',
	// 				quantity: 1,
	// 				price: 20.6871,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #40 ETH
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'ethereum' },
	// 		update: {},
	// 		create: {
	// 			id: 'ethereum',
	// 			coinsListIDMapId: 'ethereum',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'ethereum',
	// 			coinId: 'ethereum',
	// 			coinsListIDMapId: 'ethereum',
	// 			total_quantity: 0.0483667,
	// 			total_cost: 132.87,
	// 			average_price: 2747.1,
	// 			desired_sell_price: 5000,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'ethereum',
	// 				quantity: 0.0483667,
	// 				price: 2747.1,
	// 				date: new Date('2025-01-26T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #41 FIL
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'filecoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'filecoin',
	// 			coinsListIDMapId: 'filecoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'filecoin',
	// 			coinId: 'filecoin',
	// 			coinsListIDMapId: 'filecoin',
	// 			total_quantity: 1.2486047,
	// 			total_cost: 9.68,
	// 			average_price: 7.74,
	// 			desired_sell_price: 180,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'filecoin',
	// 				quantity: 1.2486047,
	// 				price: 7.74,
	// 				date: new Date('2024-12-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #42 FLOW
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'flow' },
	// 		update: {},
	// 		create: {
	// 			id: 'flow',
	// 			coinsListIDMapId: 'flow',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'flow',
	// 			coinId: 'flow',
	// 			coinsListIDMapId: 'flow',
	// 			total_quantity: 13,
	// 			total_cost: 10.03,
	// 			average_price: 0.7719,
	// 			desired_sell_price: 28,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'flow',
	// 				quantity: 13,
	// 				price: 0.7719,
	// 				date: new Date('2023-05-29T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #43 GLMR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'moonbeam' },
	// 		update: {},
	// 		create: {
	// 			id: 'moonbeam',
	// 			coinsListIDMapId: 'moonbeam',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'moonbeam',
	// 			coinId: 'moonbeam',
	// 			coinsListIDMapId: 'moonbeam',
	// 			total_quantity: 50,
	// 			total_cost: 11.98,
	// 			average_price: 0.2396,
	// 			desired_sell_price: 10,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'moonbeam',
	// 				quantity: 50,
	// 				price: 0.2396,
	// 				date: new Date('2023-07-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #44 GTC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'gitcoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'gitcoin',
	// 			coinsListIDMapId: 'gitcoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'gitcoin',
	// 			coinId: 'gitcoin',
	// 			coinsListIDMapId: 'gitcoin',
	// 			total_quantity: 21,
	// 			total_cost: 10.04,
	// 			average_price: 0.47807,
	// 			desired_sell_price: 25,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'gitcoin',
	// 				quantity: 21,
	// 				price: 0.47807,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #45 HBAR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'hedera-hashgraph' },
	// 		update: {},
	// 		create: {
	// 			id: 'hedera-hashgraph',
	// 			coinsListIDMapId: 'hedera-hashgraph',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'hedera-hashgraph',
	// 			coinId: 'hedera-hashgraph',
	// 			coinsListIDMapId: 'hedera-hashgraph',
	// 			total_quantity: 200,
	// 			total_cost: 9.3,
	// 			average_price: 0.046499,
	// 			desired_sell_price: 0.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'hedera-hashgraph',
	// 				quantity: 200,
	// 				price: 0.046499,
	// 				date: new Date('2023-10-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #46 HFT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'hashflow' },
	// 		update: {},
	// 		create: {
	// 			id: 'hashflow',
	// 			coinsListIDMapId: 'hashflow',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'hashflow',
	// 			coinId: 'hashflow',
	// 			coinsListIDMapId: 'hashflow',
	// 			total_quantity: 115,
	// 			total_cost: 12.3,
	// 			average_price: 0.107,
	// 			desired_sell_price: 1,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'hashflow',
	// 				quantity: 115,
	// 				price: 0.107,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #47 HLG
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'holograph' },
	// 		update: {},
	// 		create: {
	// 			id: 'holograph',
	// 			coinsListIDMapId: 'holograph',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'holograph',
	// 			coinId: 'holograph',
	// 			coinsListIDMapId: 'holograph',
	// 			total_quantity: 9000,
	// 			total_cost: 10.63,
	// 			average_price: 0.00118106,
	// 			desired_sell_price: 0.02,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'holograph',
	// 				quantity: 9000,
	// 				price: 0.00118106,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #48 ID
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'space-id' },
	// 		update: {},
	// 		create: {
	// 			id: 'space-id',
	// 			coinsListIDMapId: 'space-id',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'space-id',
	// 			coinId: 'space-id',
	// 			coinsListIDMapId: 'space-id',
	// 			total_quantity: 46,
	// 			total_cost: 12.09,
	// 			average_price: 0.2629,
	// 			desired_sell_price: 1.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'space-id',
	// 				quantity: 46,
	// 				price: 0.2629,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #49 ICP
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'internet-computer' },
	// 		update: {},
	// 		create: {
	// 			id: 'internet-computer',
	// 			coinsListIDMapId: 'internet-computer',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'internet-computer',
	// 			coinId: 'internet-computer',
	// 			coinsListIDMapId: 'internet-computer',
	// 			total_quantity: 2,
	// 			total_cost: 10.32,
	// 			average_price: 5.15876,
	// 			desired_sell_price: 55,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'internet-computer',
	// 				quantity: 2,
	// 				price: 5.15876,
	// 				date: new Date('2023-02-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #50 IOTA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'iota' },
	// 		update: {},
	// 		create: {
	// 			id: 'iota',
	// 			coinsListIDMapId: 'iota',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'iota',
	// 			coinId: 'iota',
	// 			coinsListIDMapId: 'iota',
	// 			total_quantity: 110,
	// 			total_cost: 21.22,
	// 			average_price: 0.1929142273,
	// 			desired_sell_price: 2.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'iota',
	// 				quantity: 46.47622691,
	// 				price: 0.215164,
	// 				date: new Date('2022-12-05T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'iota',
	// 				quantity: 0.05350149,
	// 				price: 0,
	// 				date: new Date('2022-12-15T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'iota',
	// 				quantity: 51.3002716,
	// 				price: 0.1718,
	// 				date: new Date('2022-12-28T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'iota',
	// 				quantity: 7.17,
	// 				price: 0.176985,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'iota',
	// 				quantity: 5,
	// 				price: 0.227637,
	// 				date: new Date('2023-01-30T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #51 IRON
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'iron-fish' },
	// 		update: {},
	// 		create: {
	// 			id: 'iron-fish',
	// 			coinsListIDMapId: 'iron-fish',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'iron-fish',
	// 			coinId: 'iron-fish',
	// 			coinsListIDMapId: 'iron-fish',
	// 			total_quantity: 30,
	// 			total_cost: 10.53,
	// 			average_price: 0.35114768,
	// 			desired_sell_price: 5.8,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'iron-fish',
	// 				quantity: 30,
	// 				price: 0.35114768,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #52 JUP
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'jupiter-exchange-solana' },
	// 		update: {},
	// 		create: {
	// 			id: 'jupiter-exchange-solana',
	// 			coinsListIDMapId: 'jupiter-exchange-solana',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'jupiter-exchange-solana',
	// 			coinId: 'jupiter-exchange-solana',
	// 			coinsListIDMapId: 'jupiter-exchange-solana',
	// 			total_quantity: 12,
	// 			total_cost: 10.6,
	// 			average_price: 0.883175,
	// 			desired_sell_price: 10,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'jupiter-exchange-solana',
	// 				quantity: 12,
	// 				price: 0.883175,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #53 KAVA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'kava' },
	// 		update: {},
	// 		create: {
	// 			id: 'kava',
	// 			coinsListIDMapId: 'kava',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'kava',
	// 			coinId: 'kava',
	// 			coinsListIDMapId: 'kava',
	// 			total_quantity: 21,
	// 			total_cost: 10.05,
	// 			average_price: 0.478341,
	// 			desired_sell_price: 8.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'kava',
	// 				quantity: 21,
	// 				price: 0.478341,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #54 KLV
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'klever' },
	// 		update: {},
	// 		create: {
	// 			id: 'klever',
	// 			coinsListIDMapId: 'klever',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'klever',
	// 			coinId: 'klever',
	// 			coinsListIDMapId: 'klever',
	// 			total_quantity: 4000,
	// 			total_cost: 10.54,
	// 			average_price: 0.002636,
	// 			desired_sell_price: 0.15,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'klever',
	// 				quantity: 4000,
	// 				price: 0.002636,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #55 KSM
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'kusama' },
	// 		update: {},
	// 		create: {
	// 			id: 'kusama',
	// 			coinsListIDMapId: 'kusama',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'kusama',
	// 			coinId: 'kusama',
	// 			coinsListIDMapId: 'kusama',
	// 			total_quantity: 0.25,
	// 			total_cost: 8.31,
	// 			average_price: 33.22009,
	// 			desired_sell_price: 600,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'kusama',
	// 				quantity: 0.25,
	// 				price: 33.22009,
	// 				date: new Date('2023-03-04T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #56 LAI
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'cryptogpt-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'cryptogpt-token',
	// 			coinsListIDMapId: 'cryptogpt-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'cryptogpt-token',
	// 			coinId: 'cryptogpt-token',
	// 			coinsListIDMapId: 'cryptogpt-token',
	// 			total_quantity: 2000,
	// 			total_cost: 10.24,
	// 			average_price: 0.00512118,
	// 			desired_sell_price: 0.12,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'cryptogpt-token',
	// 				quantity: 2000,
	// 				price: 0.00512118,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #57 LDO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'lido-dao' },
	// 		update: {},
	// 		create: {
	// 			id: 'lido-dao',
	// 			coinsListIDMapId: 'lido-dao',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'lido-dao',
	// 			coinId: 'lido-dao',
	// 			coinsListIDMapId: 'lido-dao',
	// 			total_quantity: 12,
	// 			total_cost: 19.86,
	// 			average_price: 1.65486937,
	// 			desired_sell_price: 10,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'lido-dao',
	// 				quantity: 12,
	// 				price: 1.65486937,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #58 LINK
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'chainlink' },
	// 		update: {},
	// 		create: {
	// 			id: 'chainlink',
	// 			coinsListIDMapId: 'chainlink',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'chainlink',
	// 			coinId: 'chainlink',
	// 			coinsListIDMapId: 'chainlink',
	// 			total_quantity: 1.5,
	// 			total_cost: 10.1,
	// 			average_price: 6.735,
	// 			desired_sell_price: 50,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'chainlink',
	// 				quantity: 1.5,
	// 				price: 6.735,
	// 				date: new Date('2023-05-29T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #59 LRC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'loopring' },
	// 		update: {},
	// 		create: {
	// 			id: 'loopring',
	// 			coinsListIDMapId: 'loopring',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'loopring',
	// 			coinId: 'loopring',
	// 			coinsListIDMapId: 'loopring',
	// 			total_quantity: 40,
	// 			total_cost: 10.38,
	// 			average_price: 0.2595851,
	// 			desired_sell_price: 3.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'loopring',
	// 				quantity: 40,
	// 				price: 0.2595851,
	// 				date: new Date('2023-01-20T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #60 LTC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'litecoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'litecoin',
	// 			coinsListIDMapId: 'litecoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'litecoin',
	// 			coinId: 'litecoin',
	// 			coinsListIDMapId: 'litecoin',
	// 			total_quantity: 0.15,
	// 			total_cost: 16.15,
	// 			average_price: 107.6833,
	// 			desired_sell_price: 500,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'litecoin',
	// 				quantity: 0.15,
	// 				price: 107.6833,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #61 MANA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'decentraland' },
	// 		update: {},
	// 		create: {
	// 			id: 'decentraland',
	// 			coinsListIDMapId: 'decentraland',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'decentraland',
	// 			coinId: 'decentraland',
	// 			coinsListIDMapId: 'decentraland',
	// 			total_quantity: 25,
	// 			total_cost: 10.52,
	// 			average_price: 0.4208,
	// 			desired_sell_price: 4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'decentraland',
	// 				quantity: 25,
	// 				price: 0.4208,
	// 				date: new Date('2023-06-08T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #62 MANTA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'manta-network' },
	// 		update: {},
	// 		create: {
	// 			id: 'manta-network',
	// 			coinsListIDMapId: 'manta-network',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'manta-network',
	// 			coinId: 'manta-network',
	// 			coinsListIDMapId: 'manta-network',
	// 			total_quantity: 24,
	// 			total_cost: 10.19,
	// 			average_price: 0.424671,
	// 			desired_sell_price: 4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'manta-network',
	// 				quantity: 24,
	// 				price: 0.424671,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #63 MEME
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'memecoin-2' },
	// 		update: {},
	// 		create: {
	// 			id: 'memecoin-2',
	// 			coinsListIDMapId: 'memecoin-2',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'memecoin-2',
	// 			coinId: 'memecoin-2',
	// 			coinsListIDMapId: 'memecoin-2',
	// 			total_quantity: 2100,
	// 			total_cost: 9.98,
	// 			average_price: 0.00475069,
	// 			desired_sell_price: 0.05,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'memecoin-2',
	// 				quantity: 2100,
	// 				price: 0.00475069,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #64 METIS
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'metis-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'metis-token',
	// 			coinsListIDMapId: 'metis-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'metis-token',
	// 			coinId: 'metis-token',
	// 			coinsListIDMapId: 'metis-token',
	// 			total_quantity: 0.5,
	// 			total_cost: 12.18,
	// 			average_price: 24.35,
	// 			desired_sell_price: 280,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'metis-token',
	// 				quantity: 0.5,
	// 				price: 24.35,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #65 MKR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'maker' },
	// 		update: {},
	// 		create: {
	// 			id: 'maker',
	// 			coinsListIDMapId: 'maker',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'maker',
	// 			coinId: 'maker',
	// 			coinsListIDMapId: 'maker',
	// 			total_quantity: 0.015,
	// 			total_cost: 10.33,
	// 			average_price: 688.92,
	// 			desired_sell_price: 5600,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'maker',
	// 				quantity: 0.015,
	// 				price: 688.92,
	// 				date: new Date('2023-05-08T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #66 NEAR
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'near' },
	// 		update: {},
	// 		create: {
	// 			id: 'near',
	// 			coinsListIDMapId: 'near',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'near',
	// 			coinId: 'near',
	// 			coinsListIDMapId: 'near',
	// 			total_quantity: 7.1920949,
	// 			total_cost: 17.56,
	// 			average_price: 2.43,
	// 			desired_sell_price: 21,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 3.3,
	// 				price: 2.551,
	// 				date: new Date('2022-12-27T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 1.65,
	// 				price: 2.18,
	// 				date: new Date('2023-04-19T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 0.05,
	// 				price: 0,
	// 				date: new Date('2024-10-02T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 1.332,
	// 				price: 4.08,
	// 				date: new Date('2024-11-06T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 0.7105849,
	// 				price: 0,
	// 				date: new Date('2024-12-02T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'near',
	// 				quantity: 0.14951,
	// 				price: 0,
	// 				date: new Date('2024-12-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #67 NEO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'neo' },
	// 		update: {},
	// 		create: {
	// 			id: 'neo',
	// 			coinsListIDMapId: 'neo',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'neo',
	// 			coinId: 'neo',
	// 			coinsListIDMapId: 'neo',
	// 			total_quantity: 2,
	// 			total_cost: 16.69,
	// 			average_price: 8.34422,
	// 			desired_sell_price: 140,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'neo',
	// 				quantity: 2,
	// 				price: 8.34422,
	// 				date: new Date('2022-12-23T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #68 NEON
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'neon' },
	// 		update: {},
	// 		create: {
	// 			id: 'neon',
	// 			coinsListIDMapId: 'neon',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'neon',
	// 			coinId: 'neon',
	// 			coinsListIDMapId: 'neon',
	// 			total_quantity: 50,
	// 			total_cost: 10.58,
	// 			average_price: 0.21152895,
	// 			desired_sell_price: 3.4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'neon',
	// 				quantity: 50,
	// 				price: 0.21152895,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #69 NOT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'notcoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'notcoin',
	// 			coinsListIDMapId: 'notcoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'notcoin',
	// 			coinId: 'notcoin',
	// 			coinsListIDMapId: 'notcoin',
	// 			total_quantity: 3500,
	// 			total_cost: 10.5,
	// 			average_price: 0.003001,
	// 			desired_sell_price: 0.03,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'notcoin',
	// 				quantity: 3500,
	// 				price: 0.003001,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #70 OMG
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'omisego' },
	// 		update: {},
	// 		create: {
	// 			id: 'omisego',
	// 			coinsListIDMapId: 'omisego',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'omisego',
	// 			coinId: 'omisego',
	// 			coinsListIDMapId: 'omisego',
	// 			total_quantity: 40,
	// 			total_cost: 10.57,
	// 			average_price: 0.2643,
	// 			desired_sell_price: 24,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'omisego',
	// 				quantity: 40,
	// 				price: 0.2643,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #71 ONDO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'ondo-finance' },
	// 		update: {},
	// 		create: {
	// 			id: 'ondo-finance',
	// 			coinsListIDMapId: 'ondo-finance',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'ondo-finance',
	// 			coinId: 'ondo-finance',
	// 			coinsListIDMapId: 'ondo-finance',
	// 			total_quantity: 15,
	// 			total_cost: 19.5,
	// 			average_price: 1.3,
	// 			desired_sell_price: 15,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'ondo-finance',
	// 				quantity: 15,
	// 				price: 1.3,
	// 				date: new Date('2025-01-22T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #72 OP
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'optimism' },
	// 		update: {},
	// 		create: {
	// 			id: 'optimism',
	// 			coinsListIDMapId: 'optimism',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'optimism',
	// 			coinId: 'optimism',
	// 			coinsListIDMapId: 'optimism',
	// 			total_quantity: 10,
	// 			total_cost: 11.2,
	// 			average_price: 1.12,
	// 			desired_sell_price: 10,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'optimism',
	// 				quantity: 10,
	// 				price: 1.12,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #73 QTUM
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'qtum' },
	// 		update: {},
	// 		create: {
	// 			id: 'qtum',
	// 			coinsListIDMapId: 'qtum',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'qtum',
	// 			coinId: 'qtum',
	// 			coinsListIDMapId: 'qtum',
	// 			total_quantity: 4,
	// 			total_cost: 11.01,
	// 			average_price: 2.754,
	// 			desired_sell_price: 27,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'qtum',
	// 				quantity: 4,
	// 				price: 2.754,
	// 				date: new Date('2023-07-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #74 REEF
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'reef' },
	// 		update: {},
	// 		create: {
	// 			id: 'reef',
	// 			coinsListIDMapId: 'reef',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'reef',
	// 			coinId: 'reef',
	// 			coinsListIDMapId: 'reef',
	// 			total_quantity: 3600,
	// 			total_cost: 11.13,
	// 			average_price: 0.003090494,
	// 			desired_sell_price: 0.06,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'reef',
	// 				quantity: 3116.24977994,
	// 				price: 0.00320899,
	// 				date: new Date('2022-12-05T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'reef',
	// 				quantity: 483.75022006,
	// 				price: 0.00232716,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #75 REN
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'republic-protocol' },
	// 		update: {},
	// 		create: {
	// 			id: 'republic-protocol',
	// 			coinsListIDMapId: 'republic-protocol',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'republic-protocol',
	// 			coinId: 'republic-protocol',
	// 			coinsListIDMapId: 'republic-protocol',
	// 			total_quantity: 500,
	// 			total_cost: 11.68,
	// 			average_price: 0.02335867,
	// 			desired_sell_price: 1.4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'republic-protocol',
	// 				quantity: 500,
	// 				price: 0.02335867,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #76 RVN
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'ravencoin' },
	// 		update: {},
	// 		create: {
	// 			id: 'ravencoin',
	// 			coinsListIDMapId: 'ravencoin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'ravencoin',
	// 			coinId: 'ravencoin',
	// 			coinsListIDMapId: 'ravencoin',
	// 			total_quantity: 1000,
	// 			total_cost: 14.84,
	// 			average_price: 0.01484,
	// 			desired_sell_price: 0.23,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'ravencoin',
	// 				quantity: 1000,
	// 				price: 0.01484,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #77 RWN
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'rowan-coin' },
	// 		update: {},
	// 		create: {
	// 			id: 'rowan-coin',
	// 			coinsListIDMapId: 'rowan-coin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'rowan-coin',
	// 			coinId: 'rowan-coin',
	// 			coinsListIDMapId: 'rowan-coin',
	// 			total_quantity: 2000,
	// 			total_cost: 20.88,
	// 			average_price: 0.01044,
	// 			desired_sell_price: 0.4,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'rowan-coin',
	// 				quantity: 2000,
	// 				price: 0.01044,
	// 				date: new Date('2025-01-22T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #78 S
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'sonic-3' },
	// 		update: {},
	// 		create: {
	// 			id: 'sonic-3',
	// 			coinsListIDMapId: 'sonic-3',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'sonic-3',
	// 			coinId: 'sonic-3',
	// 			coinsListIDMapId: 'sonic-3',
	// 			total_quantity: 50,
	// 			total_cost: 9.5,
	// 			average_price: 0.19,
	// 			desired_sell_price: 9,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'sonic-3',
	// 				quantity: 50,
	// 				price: 0.19,
	// 				date: new Date('2023-09-22T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #79 SAND
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'the-sandbox' },
	// 		update: {},
	// 		create: {
	// 			id: 'the-sandbox',
	// 			coinsListIDMapId: 'the-sandbox',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'the-sandbox',
	// 			coinId: 'the-sandbox',
	// 			coinsListIDMapId: 'the-sandbox',
	// 			total_quantity: 12.66511,
	// 			total_cost: 12.75,
	// 			average_price: 1.007,
	// 			desired_sell_price: 6.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'the-sandbox',
	// 				quantity: 12.66511,
	// 				price: 1.007,
	// 				date: new Date('2024-12-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #80 SHIB
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'shiba-inu' },
	// 		update: {},
	// 		create: {
	// 			id: 'shiba-inu',
	// 			coinsListIDMapId: 'shiba-inu',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'shiba-inu',
	// 			coinId: 'shiba-inu',
	// 			coinsListIDMapId: 'shiba-inu',
	// 			total_quantity: 1300000,
	// 			total_cost: 10.82,
	// 			average_price: 0.00000832,
	// 			desired_sell_price: 0.00009,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'shiba-inu',
	// 				quantity: 1300000,
	// 				price: 0.00000832,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #81 SOL
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'solana' },
	// 		update: {},
	// 		create: {
	// 			id: 'solana',
	// 			coinsListIDMapId: 'solana',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'solana',
	// 			coinId: 'solana',
	// 			coinsListIDMapId: 'solana',
	// 			total_quantity: 0.4995,
	// 			total_cost: 95.375,
	// 			average_price: 190.75,
	// 			desired_sell_price: 2000,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'solana',
	// 				quantity: 0.4995,
	// 				price: 190.75,
	// 				date: new Date('2025-02-13T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #82 SOSO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'sosovalue' },
	// 		update: {},
	// 		create: {
	// 			id: 'sosovalue',
	// 			coinsListIDMapId: 'sosovalue',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'sosovalue',
	// 			coinId: 'sosovalue',
	// 			coinsListIDMapId: 'sosovalue',
	// 			total_quantity: 53.49,
	// 			total_cost: 49.99,
	// 			average_price: 0.9345765564,
	// 			desired_sell_price: 2,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'sosovalue',
	// 				quantity: 47.61,
	// 				price: 1.05,
	// 				date: new Date('2025-01-26T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'sosovalue',
	// 				quantity: 5.88,
	// 				price: 0,
	// 				date: new Date('2025-01-28T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #83 STRK
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'starknet' },
	// 		update: {},
	// 		create: {
	// 			id: 'starknet',
	// 			coinsListIDMapId: 'starknet',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'starknet',
	// 			coinId: 'starknet',
	// 			coinsListIDMapId: 'starknet',
	// 			total_quantity: 48,
	// 			total_cost: 12.11,
	// 			average_price: 0.2523,
	// 			desired_sell_price: 2.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'starknet',
	// 				quantity: 48,
	// 				price: 0.2523,
	// 				date: new Date('2025-02-07T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #84 SUSHI
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'sushi' },
	// 		update: {},
	// 		create: {
	// 			id: 'sushi',
	// 			coinsListIDMapId: 'sushi',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'sushi',
	// 			coinId: 'sushi',
	// 			coinsListIDMapId: 'sushi',
	// 			total_quantity: 10,
	// 			total_cost: 12.32,
	// 			average_price: 1.2320667,
	// 			desired_sell_price: 21.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'sushi',
	// 				quantity: 10,
	// 				price: 1.2320667,
	// 				date: new Date('2023-03-20T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #85 TIA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'celestia' },
	// 		update: {},
	// 		create: {
	// 			id: 'celestia',
	// 			coinsListIDMapId: 'celestia',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'celestia',
	// 			coinId: 'celestia',
	// 			coinsListIDMapId: 'celestia',
	// 			total_quantity: 3,
	// 			total_cost: 10.63,
	// 			average_price: 3.54306,
	// 			desired_sell_price: 20,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'celestia',
	// 				quantity: 3,
	// 				price: 3.54306,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #86 TWT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'trust-wallet-token' },
	// 		update: {},
	// 		create: {
	// 			id: 'trust-wallet-token',
	// 			coinsListIDMapId: 'trust-wallet-token',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'trust-wallet-token',
	// 			coinId: 'trust-wallet-token',
	// 			coinsListIDMapId: 'trust-wallet-token',
	// 			total_quantity: 15,
	// 			total_cost: 17.83,
	// 			average_price: 1.36,
	// 			desired_sell_price: 3.5,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'trust-wallet-token',
	// 				quantity: 9.057,
	// 				price: 1.332195,
	// 				date: new Date('2022-12-27T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'trust-wallet-token',
	// 				quantity: 0.94002,
	// 				price: 1.76369,
	// 				date: new Date('2023-01-29T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'trust-wallet-token',
	// 				quantity: 1.00298,
	// 				price: 1.61795,
	// 				date: new Date('2023-01-30T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'trust-wallet-token',
	// 				quantity: 4,
	// 				price: 1.27,
	// 				date: new Date('2023-04-19T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #87 UMA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'uma' },
	// 		update: {},
	// 		create: {
	// 			id: 'uma',
	// 			coinsListIDMapId: 'uma',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'uma',
	// 			coinId: 'uma',
	// 			coinsListIDMapId: 'uma',
	// 			total_quantity: 6,
	// 			total_cost: 10.83,
	// 			average_price: 1.80417,
	// 			desired_sell_price: 33,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'uma',
	// 				quantity: 6,
	// 				price: 1.80417,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #88 UNI
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'uniswap' },
	// 		update: {},
	// 		create: {
	// 			id: 'uniswap',
	// 			coinsListIDMapId: 'uniswap',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'uniswap',
	// 			coinId: 'uniswap',
	// 			coinsListIDMapId: 'uniswap',
	// 			total_quantity: 2,
	// 			total_cost: 11.05,
	// 			average_price: 5.526,
	// 			desired_sell_price: 43,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'uniswap',
	// 				quantity: 2,
	// 				price: 5.526,
	// 				date: new Date('2023-04-24T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #89 UOS
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'ultra' },
	// 		update: {},
	// 		create: {
	// 			id: 'ultra',
	// 			coinsListIDMapId: 'ultra',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'ultra',
	// 			coinId: 'ultra',
	// 			coinsListIDMapId: 'ultra',
	// 			total_quantity: 100,
	// 			total_cost: 8.63,
	// 			average_price: 0.08628369,
	// 			desired_sell_price: 2.24,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'ultra',
	// 				quantity: 100,
	// 				price: 0.08628369,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #90 USDC
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'usd-coin' },
	// 		update: {},
	// 		create: {
	// 			id: 'usd-coin',
	// 			coinsListIDMapId: 'usd-coin',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'usd-coin',
	// 			coinId: 'usd-coin',
	// 			coinsListIDMapId: 'usd-coin',
	// 			total_quantity: 1.4306788,
	// 			total_cost: 1.4306788,
	// 			average_price: 1,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'usd-coin',
	// 				quantity: 1.4306788,
	// 				price: 1,
	// 				date: new Date('2025-02-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #91 USDT
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'tether' },
	// 		update: {},
	// 		create: {
	// 			id: 'tether',
	// 			coinsListIDMapId: 'tether',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'tether',
	// 			coinId: 'tether',
	// 			coinsListIDMapId: 'tether',
	// 			total_quantity: 206,
	// 			total_cost: 206,
	// 			average_price: 1,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'tether',
	// 				quantity: 206,
	// 				price: 1,
	// 				date: new Date('2025-02-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #92 VET
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'vechain' },
	// 		update: {},
	// 		create: {
	// 			id: 'vechain',
	// 			coinsListIDMapId: 'vechain',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'vechain',
	// 			coinId: 'vechain',
	// 			coinsListIDMapId: 'vechain',
	// 			total_quantity: 500,
	// 			total_cost: 11.15,
	// 			average_price: 0.0222948,
	// 			desired_sell_price: 0.25,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'vechain',
	// 				quantity: 500,
	// 				price: 0.0222948,
	// 				date: new Date('2023-03-29T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #93 W
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'wormhole' },
	// 		update: {},
	// 		create: {
	// 			id: 'wormhole',
	// 			coinsListIDMapId: 'wormhole',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'wormhole',
	// 			coinId: 'wormhole',
	// 			coinsListIDMapId: 'wormhole',
	// 			total_quantity: 54,
	// 			total_cost: 10.05,
	// 			average_price: 0.186051,
	// 			desired_sell_price: 2,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'wormhole',
	// 				quantity: 54,
	// 				price: 0.186051,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #94 WOO
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'woo-network' },
	// 		update: {},
	// 		create: {
	// 			id: 'woo-network',
	// 			coinsListIDMapId: 'woo-network',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'woo-network',
	// 			coinId: 'woo-network',
	// 			coinsListIDMapId: 'woo-network',
	// 			total_quantity: 50,
	// 			total_cost: 9.54,
	// 			average_price: 0.18765,
	// 			desired_sell_price: 1.6,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'woo-network',
	// 				quantity: 5,
	// 				price: 0,
	// 				date: new Date('2022-09-30T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'woo-network',
	// 				quantity: 45,
	// 				price: 0.2085,
	// 				date: new Date('2023-03-30T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #95 XAI
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'xai-blockchain' },
	// 		update: {},
	// 		create: {
	// 			id: 'xai-blockchain',
	// 			coinsListIDMapId: 'xai-blockchain',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'xai-blockchain',
	// 			coinId: 'xai-blockchain',
	// 			coinsListIDMapId: 'xai-blockchain',
	// 			total_quantity: 90,
	// 			total_cost: 10.05,
	// 			average_price: 0.111628,
	// 			desired_sell_price: 1.52,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'xai-blockchain',
	// 				quantity: 90,
	// 				price: 0.111628,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #96 XCH
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'chia' },
	// 		update: {},
	// 		create: {
	// 			id: 'chia',
	// 			coinsListIDMapId: 'chia',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'chia',
	// 			coinId: 'chia',
	// 			coinsListIDMapId: 'chia',
	// 			total_quantity: 1,
	// 			total_cost: 19.87,
	// 			average_price: 19.87,
	// 			desired_sell_price: 500,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'chia',
	// 				quantity: 1,
	// 				price: 19.87,
	// 				date: new Date('2025-01-22T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #97 XEM
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'nem' },
	// 		update: {},
	// 		create: {
	// 			id: 'nem',
	// 			coinsListIDMapId: 'nem',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'nem',
	// 			coinId: 'nem',
	// 			coinsListIDMapId: 'nem',
	// 			total_quantity: 250,
	// 			total_cost: 10.03,
	// 			average_price: 0.0401091,
	// 			desired_sell_price: 0.8,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'nem',
	// 				quantity: 250,
	// 				price: 0.0401091,
	// 				date: new Date('2022-12-27T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #98 XTZ
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'tezos' },
	// 		update: {},
	// 		create: {
	// 			id: 'tezos',
	// 			coinsListIDMapId: 'tezos',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'tezos',
	// 			coinId: 'tezos',
	// 			coinsListIDMapId: 'tezos',
	// 			total_quantity: 21.869092,
	// 			total_cost: 15.16,
	// 			average_price: 0.7312940986,
	// 			desired_sell_price: 9.8,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 15.999,
	// 				price: 0.740762,
	// 				date: new Date('2022-12-27T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 2.001,
	// 				price: 0.762699,
	// 				date: new Date('2023-01-06T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 2,
	// 				price: 0.85587,
	// 				date: new Date('2023-01-12T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 0.861,
	// 				price: 1.05,
	// 				date: new Date('2024-02-13T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 0.248,
	// 				price: 0,
	// 				date: new Date('2024-04-10T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 0.714,
	// 				price: 0,
	// 				date: new Date('2024-06-10T00:00:00'),
	// 			},
	// 			{
	// 				userCoinId: 'tezos',
	// 				quantity: 0.047,
	// 				price: 0,
	// 				date: new Date('2024-08-10T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #99 ZETA
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'zetachain' },
	// 		update: {},
	// 		create: {
	// 			id: 'zetachain',
	// 			coinsListIDMapId: 'zetachain',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'zetachain',
	// 			coinId: 'zetachain',
	// 			coinsListIDMapId: 'zetachain',
	// 			total_quantity: 30,
	// 			total_cost: 10.02,
	// 			average_price: 0.3340492,
	// 			desired_sell_price: 2.7,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'zetachain',
	// 				quantity: 30,
	// 				price: 0.3340492,
	// 				date: new Date('2025-02-11T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
	// // #100 ZIL
	// await prisma.$transaction(async (prisma) => {
	// 	await prisma.coin.upsert({
	// 		where: { id: 'zilliqa' },
	// 		update: {},
	// 		create: {
	// 			id: 'zilliqa',
	// 			coinsListIDMapId: 'zilliqa',
	// 		},
	// 	})
	// 	await prisma.userCoin.create({
	// 		data: {
	// 			userId,
	// 			id: 'zilliqa',
	// 			coinId: 'zilliqa',
	// 			coinsListIDMapId: 'zilliqa',
	// 			total_quantity: 400,
	// 			total_cost: 11.38,
	// 			average_price: 0.028458,
	// 			desired_sell_price: 0.24,
	// 		},
	// 	})
	// 	await prisma.userCoinTransaction.createMany({
	// 		data: [
	// 			{
	// 				userCoinId: 'zilliqa',
	// 				quantity: 400,
	// 				price: 0.028458,
	// 				date: new Date('2023-03-04T00:00:00'),
	// 			},
	// 		],
	// 	})
	// })
}

async function down() {
	// await prisma.$executeRaw`DELETE FROM "user_coin" CASCADE;`
	// await prisma.$executeRaw`TRUNCATE TABLE "user_coin" RESTART IDENTITY CASCADE;`
	// await prisma.$executeRaw`TRUNCATE TABLE "user_coin_transaction" RESTART IDENTITY CASCADE;`
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
