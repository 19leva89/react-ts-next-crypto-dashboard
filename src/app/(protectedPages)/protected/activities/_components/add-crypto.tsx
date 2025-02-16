'use client'

import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import { ChangeEvent, CSSProperties, useCallback, useEffect, useMemo, useState } from 'react'

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
	Skeleton,
} from '@/components/ui'
import { CoinsListIDMapData } from '@/app/api/types'
import { addCryptoToUser, getCoinsListIDMap } from '@/app/api/actions'

export const AddCrypto = () => {
	const [editPrice, setEditPrice] = useState<string>('')
	const [editQuantity, setEditQuantity] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [selectedCrypto, setSelectedCrypto] = useState<string>('')
	const [coinsListIDMapData, setCoinsListIDMapData] = useState<CoinsListIDMapData>([])

	useEffect(() => {
		if (!isDialogOpen) return

		const fetchData = async () => {
			setIsLoading(true)

			try {
				const coinsList = await getCoinsListIDMap()

				setCoinsListIDMapData(coinsList)
			} catch (error) {
				console.error('Error fetching CoinsListIDMap:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [isDialogOpen])

	const filteredCoins = useMemo(
		() =>
			coinsListIDMapData.filter(
				(coin) =>
					coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[coinsListIDMapData, searchQuery],
	)

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^-?[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handlePriceChange = handleNumberInput(setEditPrice)
	const handleQuantityChange = handleNumberInput(setEditQuantity)

	const handleAddCrypto = async () => {
		try {
			// Проверяем, что выбрана криптовалюта и введено количество
			if (!selectedCrypto || !editQuantity || !editPrice) {
				toast.error('Please select a coin, enter a quantity and buy price')
				return
			}

			// Вызываем функцию для добавления криптовалюты
			await addCryptoToUser(selectedCrypto, Number(editQuantity), Number(editPrice))

			// Уведомляем пользователя об успехе
			toast.success('Crypto added successfully')

			// Закрываем диалог
			setIsDialogOpen(false)

			// Очищаем поля
			setEditPrice('')
			setEditQuantity('')
			setSelectedCrypto('')
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

	const Row = useCallback(
		({ index, style }: { index: number; style: CSSProperties }) => {
			const coin = filteredCoins[index]

			return (
				<SelectItem
					key={coin.id}
					value={coin.id}
					style={style}
					className="rounded-lg truncate cursor-pointer"
				>
					<div className="flex items-center gap-2 h-5">
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={20}
							height={20}
							onError={(e) => {
								;(e.currentTarget as HTMLImageElement).src = '/svg/coin-not-found.svg'
							}}
						/>

						<span className="truncate">
							{coin.name} ({coin.symbol.toUpperCase()})
						</span>
					</div>
				</SelectItem>
			)
		},
		[filteredCoins],
	)

	const selectedCoinData = useMemo(
		() => coinsListIDMapData.find((coin) => coin.id === selectedCrypto),
		[selectedCrypto, coinsListIDMapData],
	)

	return (
		<div className="flex flex-col gap-4 mx-6">
			<div className="flex justify-end">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="rounded-xl text-white">
							<Plus className="mr-2 h-4 w-4" />
							Add Transaction
						</Button>
					</DialogTrigger>

					<DialogContent className="px-8 rounded-xl">
						<DialogHeader>
							<DialogTitle>Add Transaction</DialogTitle>

							<DialogDescription>Select a coin, enter the quantity and price</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="crypto" className="text-right">
									Crypto
								</Label>

								<Select value={selectedCrypto} onValueChange={(value) => setSelectedCrypto(value)}>
									<SelectTrigger className="col-span-3">
										{selectedCoinData ? (
											<div className="flex items-center gap-2">
												<Image
													src={selectedCoinData.image || '/svg/coin-not-found.svg'}
													alt={selectedCoinData.name}
													width={20}
													height={20}
												/>
												<span>
													{selectedCoinData.name} ({selectedCoinData.symbol.toUpperCase()})
												</span>
											</div>
										) : (
											<span>Select a cryptocurrency</span>
										)}
									</SelectTrigger>

									<SelectContent>
										{/* Input for search filter */}
										<div className="p-2">
											<Input
												type="text"
												placeholder="Search coin..."
												value={searchQuery}
												onChange={(e) => {
													setSearchQuery(e.target.value)
													setSelectedCrypto('')
												}}
											/>
										</div>

										{isLoading ? (
											<Skeleton className="h-52 w-full" />
										) : (
											<List
												height={200}
												width={325}
												itemSize={40}
												itemCount={filteredCoins.length}
												overscanCount={15}
											>
												{Row}
											</List>
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
								<Label htmlFor="price" className="text-right">
									Price
								</Label>

								<Input
									id="price"
									type="number"
									placeholder="Enter price"
									min={0}
									step={0.01}
									value={editPrice}
									onChange={handlePriceChange}
									className="col-span-3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleAddCrypto} className="rounded-xl text-white">
								Submit
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
