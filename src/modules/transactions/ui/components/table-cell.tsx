import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'

export function TableCell({ value }: { value: number }) {
	const formatUSDPrice = useFormatUSDPrice()

	return <div className='px-3 py-2 text-sm xl:text-base'>{formatUSDPrice(value, true)}</div>
}
