'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChangeEvent, CSSProperties, useCallback, useMemo, useState, useRef, useEffect } from 'react'

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
import { useTRPC } from '@/trpc/client'

export const AddCoin = () => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const searchInputRef = useRef<HTMLInputElement>(null)

	const { data: coinsListIDMapData = [], isLoading } = useQuery(trpc.coins.getCoinsListIDMap.queryOptions())

	const [editPrice, setEditPrice] = useState<string>('')
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [editQuantity, setEditQuantity] = useState<string>('')
	const [selectedCoin, setSelectedCoin] = useState<string>('')
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

	// New state variables for managing Select open state and search focus
	const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
	const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false)

	useEffect(() => {
		if (isSelectOpen && searchInputRef.current) {
			searchInputRef.current.focus()
		}
	}, [isSelectOpen])

	const addCoinMutation = useMutation(
		trpc.coins.addCoinToUser.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries(trpc.coins.getUserCoins.queryOptions())

				toast.success('Coin added successfully')
			},
			onError: (error) => {
				console.error('Failed to add coin:', error)
				toast.error('Failed to add coin. Please try again')
			},
		}),
	)

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

	const handleAddCoin = async () => {
		setIsAdding(true)

		try {
			// Check that the cryptocurrency is selected and the amount is entered
			if (!selectedCoin || !editQuantity || !editPrice) {
				toast.error('Please select a coin, enter a quantity and buy price')

				return
			}

			await addCoinMutation.mutateAsync({
				coinId: selectedCoin,
				quantity: Number(editQuantity),
				price: Number(editPrice),
				image: selectedCoinData?.image ?? '',
			})

			setIsDialogOpen(false)
		} finally {
			setIsAdding(false)

			// Clearing the fields
			setEditPrice('')
			setEditQuantity('')
			setSelectedCoin('')
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
					className='cursor-pointer truncate rounded-lg'
				>
					<div className='flex h-5 items-center gap-2'>
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={20}
							height={20}
							onError={(e) => {
								e.currentTarget.src = '/svg/coin-not-found.svg'
							}}
						/>

						<span className='truncate'>
							{coin.name} ({coin.symbol.toUpperCase()})
						</span>
					</div>
				</SelectItem>
			)
		},
		[filteredCoins],
	)

	const selectedCoinData = useMemo(
		() => coinsListIDMapData.find((coin) => coin.id === selectedCoin),

		[selectedCoin, coinsListIDMapData],
	)

	return (
		<div className='mx-6 flex flex-col gap-4'>
			<div className='flex justify-end'>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							variant='default'
							size='default'
							className='rounded-xl text-white transition-colors duration-300 ease-in-out'
						>
							<PlusIcon className='mr-2 size-4' />
							Transaction
						</Button>
					</DialogTrigger>

					<DialogContent className='rounded-xl px-8'>
						<DialogHeader>
							<DialogTitle>Add Transaction</DialogTitle>

							<DialogDescription>Select a coin, enter the quantity and price</DialogDescription>
						</DialogHeader>

						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='coin' className='text-right'>
									Coin
								</Label>

								<Select
									value={selectedCoin}
									onValueChange={(value) => setSelectedCoin(value)}
									open={isSelectOpen}
									onOpenChange={(open) => {
										if (!open && isSearchFocused) return
										setIsSelectOpen(open)
									}}
								>
									<SelectTrigger className='col-span-3 w-full'>
										{selectedCoinData ? (
											<div className='flex items-center gap-2 truncate'>
												<Image
													src={selectedCoinData.image || '/svg/coin-not-found.svg'}
													alt={selectedCoinData.name}
													width={20}
													height={20}
													onError={(e) => {
														e.currentTarget.src = '/svg/coin-not-found.svg'
													}}
												/>
												<span>
													{selectedCoinData.name} ({selectedCoinData.symbol.toUpperCase()})
												</span>
											</div>
										) : (
											<span>Select a coin currency</span>
										)}
									</SelectTrigger>

									<SelectContent>
										{/* Input for search filter */}
										<div className='p-2'>
											<Input
												ref={searchInputRef}
												type='text'
												placeholder='Search coin...'
												value={searchQuery}
												onChange={(e) => {
													setSearchQuery(e.target.value)
													setSelectedCoin('')
												}}
												onFocus={() => setIsSearchFocused(true)}
												onBlur={() => setIsSearchFocused(false)}
											/>
										</div>

										{isLoading ? (
											<Skeleton className='h-52 w-full' />
										) : (
											<List
												height={200}
												width={320}
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

							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='quantity' className='text-right'>
									Quantity
								</Label>

								<Input
									id='quantity'
									type='number'
									placeholder='Enter quantity'
									min={0}
									step={0.01}
									value={editQuantity}
									onChange={handleQuantityChange}
									className='col-span-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
								/>
							</div>

							<div className='grid grid-cols-4 items-center gap-4'>
								<Label htmlFor='price' className='text-right'>
									Price
								</Label>

								<Input
									id='price'
									type='number'
									placeholder='Enter price'
									min={0}
									step={0.01}
									value={editPrice}
									onChange={handlePriceChange}
									className='col-span-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
								/>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant='default'
								size='default'
								onClick={handleAddCoin}
								disabled={isLoading || isAdding}
								loading={isAdding}
								className='rounded-xl text-white transition-colors duration-300 ease-in-out'
							>
								Submit
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
