import { useFormatPrice } from '@/hooks/use-format-price'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'

export function TableCell({ value }: { value: number }) {
	const formatPrice = useFormatPrice()
	const { fromUSD } = useCurrencyConverter()

	return (
		<div className='px-3 py-2 text-base max-[1200px]:text-sm'>{formatPrice(fromUSD(value), true, true)}</div>
	)
}
