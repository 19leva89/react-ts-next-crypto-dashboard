import { useFormatPrice } from '@/hooks/use-format-price'

export function TableCell({ value }: { value: number }) {
	const formatPrice = useFormatPrice()

	return <div className='px-3 py-2 text-base max-[1200px]:text-sm'>{formatPrice(value, true, true)}</div>
}
