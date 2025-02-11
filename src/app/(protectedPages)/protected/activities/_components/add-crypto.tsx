'use client'

import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import { ChangeEvent, useEffect, useState } from 'react'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
} from '@/components/ui'
import { CoinsListIDMapData } from '@/app/api/types'
import { addCryptoToUser, getCoinsListIDMap } from '@/app/api/actions'

export const AddCrypto = () => {
	const [editQuantity, setEditQuantity] = useState<string>('')
	const [editBuyPrice, setEditBuyPrice] = useState<string>('')
	const [editSellPrice, setEditSellPrice] = useState<string>('')
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [selectedCrypto, setSelectedCrypto] = useState<string>('')

	const [getCoinData, setGetCoinData] = useState<boolean>(false)
	const [coinsListIDMapData, setCoinsListIDMapData] = useState<CoinsListIDMapData>()

	useEffect(() => {
		if (!isDialogOpen) return

		setGetCoinData(true)
		setCoinsListIDMapData(undefined)

		const fetchData = async () => {
			try {
				const coinsList = await getCoinsListIDMap()

				setCoinsListIDMapData(coinsList)
			} catch (error) {
				console.error('Error fetching CoinsListIDMap:', error)
			} finally {
				setGetCoinData(false)
			}
		}

		fetchData()
	}, [setCoinsListIDMapData, isDialogOpen])

	const filteredCoins = coinsListIDMapData?.filter(
		(coin) =>
			coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value

		// Разрешаем только цифры, точку и запятую
		if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return

		// Заменяем запятую на точку (если вводится 4,001 -> 4.001)
		value = value.replace(/,/g, '.')

		// Проверяем количество точек
		if ((value.match(/\./g) || []).length > 1) return

		setter(value)
	}

	const handleQuantityChange = handleNumberInput(setEditQuantity)
	const handleBuyPriceChange = handleNumberInput(setEditBuyPrice)
	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const handleAddCrypto = async () => {
		try {
			// Проверяем, что выбрана криптовалюта и введено количество
			if (!selectedCrypto || !editQuantity || !editBuyPrice) {
				toast.error('Please select a coin, enter a quantity and buy price')
				return
			}

			// Вызываем функцию для добавления криптовалюты
			await addCryptoToUser(selectedCrypto, Number(editQuantity), Number(editBuyPrice), Number(editSellPrice))

			// Уведомляем пользователя об успехе
			toast.success('Crypto added successfully')

			// Закрываем диалог
			setIsDialogOpen(false)

			// Очищаем поля
			setSelectedCrypto('')
			setEditQuantity('')
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error adding crypto:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to add crypto. Please try again')
			}
		}
	}

	return (
		<div className="flex flex-col gap-4 mx-6">
			<div className="flex justify-end">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="rounded-xl text-white">
							<Plus className="mr-2 h-4 w-4" />
							Add Crypto
						</Button>
					</DialogTrigger>

					<DialogContent className="px-8 rounded-xl">
						<DialogHeader>
							<DialogTitle>Add New Crypto</DialogTitle>

							<DialogDescription>Select a cryptocurrency and enter the quantity</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="crypto" className="text-right">
									Crypto
								</Label>

								<Select
									value={selectedCrypto}
									onValueChange={(value) => {
										setSelectedCrypto(value)
									}}
								>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="Select a cryptocurrency" />
									</SelectTrigger>

									<SelectContent>
										{/* Input for search filter */}
										<div className="p-2">
											<Input
												type="text"
												placeholder="Search coin..."
												value={searchQuery}
												onChange={(e) => setSearchQuery(e.target.value)}
											/>
										</div>

										{getCoinData ? (
											<Skeleton className="h-52 w-full" />
										) : (
											(() => {
												const selectedIndex = filteredCoins?.findIndex((coin) => coin.id === selectedCrypto)
												const itemHeight = 40

												return (
													<List
														height={200}
														width={325}
														itemSize={itemHeight}
														itemCount={filteredCoins?.length as number}
														initialScrollOffset={
															(selectedIndex as number) > -1 ? (selectedIndex as number) * itemHeight : 0
														}
													>
														{({ index, style }) => {
															const coin = filteredCoins && filteredCoins[index]

															return (
																<SelectItem
																	key={coin?.id}
																	value={coin?.id as string}
																	className="rounded-xl truncate"
																	style={style}
																>
																	<div className="flex flex-row gap-2 h-5">
																		<Image
																			src={coin?.image || '/svg/coin-not-found.svg'}
																			alt={coin?.name || 'Coin image'}
																			width={20}
																			height={20}
																		/>

																		<span className="truncate">
																			{coin?.name} ({coin?.symbol.toUpperCase()})
																		</span>
																	</div>
																</SelectItem>
															)
														}}
													</List>
												)
											})()
										)}
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="quantity" className="text-right">
									Quantity
								</Label>

								<Input
									id="quantity"
									type="number"
									placeholder="Enter quantity"
									min={0}
									step={0.01}
									value={editQuantity}
									onChange={handleQuantityChange}
									className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="buy-price" className="text-right">
									Buy Price
								</Label>

								<Input
									id="buy-price"
									type="number"
									placeholder="Enter buy price"
									min={0}
									step={0.01}
									value={editBuyPrice}
									onChange={handleBuyPriceChange}
									className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="sell-price" className="text-right">
									Sell Price
								</Label>

								<Input
									id="sell-price"
									type="number"
									placeholder="Enter sell price"
									min={0}
									step={0.01}
									value={editSellPrice}
									onChange={handleSellPriceChange}
									className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleAddCrypto} className="rounded-xl text-white">
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
