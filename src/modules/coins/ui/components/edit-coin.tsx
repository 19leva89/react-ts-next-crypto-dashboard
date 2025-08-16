import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { ChangeEvent, useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from '@/components/ui'
import { useTRPC } from '@/trpc/client'
import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'
import { TTransaction, TUserCoinData } from '@/modules/coins/schema'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'
import { TableContainer } from '@/components/shared/data-tables/transaction-table'

interface Props {
	coin: TUserCoinData
	isOpen: boolean
	onClose: () => void
}

export const EditCoin = ({ coin, isOpen, onClose }: Props) => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const totalValue = coin.current_price * coin.total_quantity

	const formatUSDPrice = useFormatUSDPrice()
	const { fromUSD, toUSD, selectedCurrency } = useCurrencyConverter()

	const [isSaving, setIsSaving] = useState<boolean>(false)
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [editTransactions, setEditTransactions] = useState<TTransaction[]>(coin.transactions)
	const [editSellPrice, setEditSellPrice] = useState<string>(() => {
		if (coin.desired_sell_price) {
			const convertedPrice = fromUSD(coin.desired_sell_price)

			return String(convertedPrice)
		}

		return ''
	})

	// Sync local state with updated data (important, don't remove)
	useEffect(() => {
		setEditTransactions(coin.transactions)

		if (coin.desired_sell_price) {
			const convertedPrice = fromUSD(coin.desired_sell_price)
			setEditSellPrice(String(convertedPrice))
		} else {
			setEditSellPrice('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [coin.transactions, coin.desired_sell_price, selectedCurrency])

	const createTransactionMutation = useMutation(
		trpc.coins.addTransactionForUser.mutationOptions({
			onSuccess: (newTransaction) => {
				setEditTransactions((prev) => [...prev, newTransaction])

				toast.success('Transaction created successfully')
			},
			onError: (error) => {
				console.error('Create transaction error:', error)
				toast.error('Failed to create transaction')
			},
		}),
	)

	const updateCoinMutation = useMutation(
		trpc.coins.updateUserCoin.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.coins.getUserCoin.queryOptions(coin.coinId))
				queryClient.invalidateQueries(trpc.coins.getUserCoins.queryOptions())

				toast.success('Coin updated successfully')

				onClose()
			},
			onError: (error) => {
				console.error('Update error:', error)
				toast.error('Failed to update coin')
			},
		}),
	)

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const handleAddTransaction = async () => {
		setIsAdding(true)

		try {
			await createTransactionMutation.mutateAsync({
				coinId: coin.coinId,
				quantity: 0,
				price: 0,
				date: new Date().toISOString(),
			})
		} finally {
			setIsAdding(false)
		}
	}

	const handleUpdate = async (sellPrice: string) => {
		setIsSaving(true)

		try {
			const updatedTransactions = editTransactions.map((transaction) => ({
				...transaction,
				quantity: transaction.quantity,
				price: transaction.price,
				date: new Date(transaction.date).toISOString(),
				wallet: transaction.wallet,
			}))

			const sellPriceInUSD = sellPrice ? toUSD(Number(sellPrice)) : undefined

			await updateCoinMutation.mutateAsync({
				coinId: coin.coinId,
				desiredSellPrice: sellPriceInUSD,
				transactions: updatedTransactions,
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='rounded-xl max-[450px]:px-1 sm:max-w-2xl'>
				<DialogHeader className='px-4'>
					<DialogTitle>Edit quantity, price or date</DialogTitle>

					<DialogDescription>Update values of {coin.name} in your portfolio</DialogDescription>
				</DialogHeader>

				<div className='flex flex-col gap-4 py-4'>
					<div className='flex items-center justify-start gap-4 px-4'>
						<Label htmlFor='sell-price' className='w-[20%]'>
							Sell price
						</Label>

						<Input
							id='sell-price'
							type='number'
							placeholder='Enter desired sell price'
							min={0}
							step={0.01}
							value={editSellPrice}
							onChange={handleSellPriceChange}
							className='w-[80%] [appearance:textfield] rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
						/>
					</div>

					{/* Section for displaying transactions and sales */}
					<div className='mt-2'>
						<div className='mb-1 flex items-center justify-between'>
							<h3 className='px-4 text-lg font-semibold max-[400px]:text-sm'>Transaction History</h3>

							<div className='flex flex-col px-4 max-[600px]:text-sm'>
								<p className=''>Total invested: {formatUSDPrice(coin.total_cost, false)}</p>

								<p className=''>Total value: {formatUSDPrice(totalValue, false)}</p>
							</div>
						</div>

						<TableContainer
							editTransactions={editTransactions}
							onChange={setEditTransactions}
							className='h-[50vh]'
						/>
					</div>
				</div>

				<DialogFooter className='flex-row justify-end gap-3 px-4'>
					<Button
						variant='outline'
						size='default'
						onClick={handleAddTransaction}
						disabled={isAdding || isSaving}
						loading={isAdding}
						className='rounded-xl transition-colors duration-300 ease-in-out'
					>
						<PlusIcon className='size-4' />
						<span>Transaction</span>
					</Button>

					<Button
						variant='default'
						size='default'
						onClick={() => handleUpdate(editSellPrice)}
						disabled={isSaving || isAdding}
						loading={isSaving}
						className='rounded-xl text-white transition-colors duration-300 ease-in-out'
					>
						<span>Save changes</span>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
