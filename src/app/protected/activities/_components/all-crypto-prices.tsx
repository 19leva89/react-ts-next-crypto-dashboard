import { formatPrice } from '@/constants/format-price'

interface Props {
	totalValue: number
}

export const AllCryptoPrices = ({ totalValue }: Props) => {
	return (
		<div className="p-2 px-6">
			<h2 className="text-2xl font-bold">Total crypto: ${formatPrice(totalValue, true, 2)}</h2>
		</div>
	)
}
