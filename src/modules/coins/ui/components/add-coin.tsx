'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { List } from 'react-window'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIcon, BanknoteIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import { ChangeEvent, CSSProperties, useCallback, useMemo, useState, useRef, useEffect, useId } from 'react'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	Spinner,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { getWalletDisplayName } from '@/data/wallet'
import { WALLETS, TWallet } from '@/modules/coins/schema'
import { WalletIcon } from '@/modules/transactions/ui/components/wallet-icon'

interface Props {
	className?: string
}

interface RowComponentProps {
	index: number
	style: CSSProperties
	data: { id: string; name: string; symbol: string; image: string | null }[]
}

export const AddCoin = ({ className }: Props) => {
	const trpc = useTRPC()
	const coinSelectId = useId()
	const walletSelectId = useId()
	const queryClient = useQueryClient()
	const searchInputRef = useRef<HTMLInputElement>(null)

	const { data: coinsListIDMapData = [], isLoading } = useQuery(trpc.coins.getCoinsListIDMap.queryOptions())

	const [editPrice, setEditPrice] = useState<string>('')
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [editQuantity, setEditQuantity] = useState<string>('')
	const [selectedCoin, setSelectedCoin] = useState<string>('')
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [selectedWallet, setSelectedWallet] = useState<TWallet>(WALLETS.OTHER)

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
				toast.error('Please select a coin, enter quantity and price')

				return
			}

			await addCoinMutation.mutateAsync({
				coinId: selectedCoin,
				quantity: Number(editQuantity),
				price: Number(editPrice),
				image: selectedCoinData?.image ?? '/svg/coin-not-found.svg',
				wallet: selectedWallet,
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

	const RowComponent = useCallback(
		({ index, style }: RowComponentProps) => {
			const coin = filteredCoins[index]

			return (
				<SelectItem
					key={coin.id}
					value={coin.id}
					style={style}
					className='!w-[99%] cursor-pointer truncate rounded-xl'
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

						<span className='w-60 truncate'>
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
		<div className={className}>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger asChild>
					<Button
						variant='default'
						size='default'
						className='rounded-xl text-white transition-colors duration-300 ease-in-out'
					>
						<PlusIcon className='mr-2 size-4' />
						<span>Transaction</span>
					</Button>
				</DialogTrigger>

				<DialogContent className='rounded-xl px-8'>
					<DialogHeader>
						<DialogTitle>Add Transaction</DialogTitle>

						<DialogDescription>Select a coin, enter quantity and price</DialogDescription>
					</DialogHeader>

					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor={coinSelectId} className='text-right'>
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
								<SelectTrigger
									id={coinSelectId}
									aria-label='Select coin'
									className='col-span-3 w-full rounded-xl'
								>
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

											<span className='truncate'>
												{selectedCoinData.name} ({selectedCoinData.symbol.toUpperCase()})
											</span>
										</div>
									) : (
										<span>Select a coin currency</span>
									)}
								</SelectTrigger>

								<SelectContent className='rounded-xl'>
									{/* Input for search filter */}
									<div className='p-2'>
										<InputGroup className='h-10 overflow-hidden rounded-xl dark:bg-transparent'>
											<InputGroupAddon align='inline-start'>
												<SearchIcon className='size-4.5' />
											</InputGroupAddon>

											<InputGroupInput
												id='coin-search'
												type='text'
												placeholder='Search coin...'
												ref={searchInputRef}
												value={searchQuery}
												onChange={(e) => {
													setSearchQuery(e.target.value)
													setSelectedCoin('')
												}}
												onFocus={() => setIsSearchFocused(true)}
												onBlur={() => setIsSearchFocused(false)}
											/>

											<InputGroupAddon align='inline-end'>
												<Tooltip>
													<TooltipTrigger asChild>
														<InputGroupButton
															variant='ghost'
															size='icon-sm'
															onClick={() => setSearchQuery('')}
															className={cn(
																'hover:bg-transparent dark:hover:text-gray-200',
																searchQuery ? 'opacity-100' : 'pointer-events-none opacity-0',
															)}
														>
															<XIcon />
														</InputGroupButton>
													</TooltipTrigger>

													<TooltipContent className='rounded-xl text-white'>
														<p>Clear</p>
													</TooltipContent>
												</Tooltip>
											</InputGroupAddon>
										</InputGroup>
									</div>

									{isLoading ? (
										<Skeleton className='h-52 w-full rounded-xl' />
									) : (
										<List
											rowComponent={({ index, style }) => (
												<RowComponent index={index} style={style} data={filteredCoins} />
											)}
											rowCount={filteredCoins.length}
											rowHeight={40}
											rowProps={{
												'aria-posinset': 1,
												'aria-setsize': filteredCoins.length,
												role: 'listitem',
											}}
											overscanCount={15}
											className='h-50 w-80 cursor-pointer
												[&::-webkit-scrollbar]:h-1.5
												[&::-webkit-scrollbar]:w-1.5
												[&::-webkit-scrollbar-thumb]:rounded-full
												[&::-webkit-scrollbar-thumb]:bg-gray-400
												dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
												[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
												dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500
												[&::-webkit-scrollbar-track]:m-1.5
												[&::-webkit-scrollbar-track]:rounded-full
												[&::-webkit-scrollbar-track]:bg-gray-100
												dark:[&::-webkit-scrollbar-track]:bg-slate-800'
										/>
									)}
								</SelectContent>
							</Select>
						</div>

						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='quantity' className='text-right'>
								Quantity
							</Label>

							<InputGroup className='col-span-3 h-10 rounded-xl dark:bg-transparent'>
								<InputGroupAddon align='inline-start'>
									<ActivityIcon className='size-3 sm:size-3.5 lg:size-4' />
								</InputGroupAddon>

								<InputGroupInput
									id='quantity'
									type='number'
									placeholder='Enter quantity'
									min={0}
									step={0.01}
									value={editQuantity}
									onChange={handleQuantityChange}
									className='[appearance:textfield] rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
								/>
							</InputGroup>
						</div>

						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='price' className='text-right'>
								Price
							</Label>

							<InputGroup className='col-span-3 h-10 rounded-xl dark:bg-transparent'>
								<InputGroupAddon align='inline-start'>
									<BanknoteIcon className='size-3 sm:size-3.5 lg:size-4' />
								</InputGroupAddon>

								<InputGroupInput
									id='price'
									type='number'
									placeholder='Enter price'
									min={0}
									step={0.01}
									value={editPrice}
									onChange={handlePriceChange}
									className='[appearance:textfield] rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
								/>
							</InputGroup>
						</div>

						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor={walletSelectId} className='text-right'>
								Wallet
							</Label>

							<div className='col-span-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'>
								<Select
									value={selectedWallet}
									onValueChange={(value) => {
										setSelectedWallet(value as TWallet)
									}}
								>
									<SelectTrigger
										id={walletSelectId}
										aria-label={`Current wallet: ${getWalletDisplayName(selectedWallet as keyof typeof WALLETS)}`}
										className='w-full rounded-xl'
									>
										<SelectValue placeholder='Select wallet' />
									</SelectTrigger>

									<SelectContent className='rounded-xl'>
										{Object.keys(WALLETS).map((walletKey) => (
											<SelectItem key={walletKey} value={walletKey} className='rounded-xl'>
												<WalletIcon wallet={walletKey as keyof typeof WALLETS} />

												{getWalletDisplayName(walletKey as keyof typeof WALLETS)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter>
							<Button
								variant='default'
								size='default'
								onClick={handleAddCoin}
								disabled={isLoading || isAdding}
								className='rounded-xl text-white transition-colors duration-300 ease-in-out'
							>
								{(isLoading || isAdding) && <Spinner className='size-5 text-white' />}
								{isLoading || isAdding ? 'Submitting' : 'Submit'}
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
