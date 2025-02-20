import { UserCoinData } from '@/app/api/types'
import { Input, Label } from '@/components/ui'
import { formatPrice } from '@/constants/format-price'
import { DataTable } from '../../_components/transaction-table-data'
import { getColumns } from '../../_components/transaction-table-columns'

interface Props {
	coin: UserCoinData
}

export const CoinIdContainer = ({ coin }: Props) => {
	return (
		<div className="flex flex-col gap-4 py-4">
			<div className="flex items-center justify-start gap-4 px-4">
				<Label htmlFor="sell-price" className="w-[20%]">
					Sell Price
				</Label>

				<Input
					id="sell-price"
					type="number"
					min={0}
					step={0.01}
					// value={editSellPrice}
					// onChange={handleSellPriceChange}
					className="w-[80%] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
			</div>

			{/* Section for displaying transactions and sales */}
			<div className="mt-2">
				<div className="flex items-center justify-between mb-1">
					<h3 className="px-4 text-lg font-semibold max-[400px]:text-sm">Transaction History</h3>

					<div className="flex flex-col px-4 max-[600px]:text-sm">
						<p className="">Total invested: ${formatPrice(coin.totalCost, false)}</p>

						{/* <p className="">Total value: ${formatPrice(totalValue, false)}</p> */}
					</div>
				</div>

				{/* <DataTable
					columns={getColumns(onTransactionChange, handleTransactionDelete)}
					data={editTransactions}
				/> */}
			</div>
		</div>
	)
}
