import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'

/**
 * Table cell component for displaying formatted USD price values
 * Handles responsive typography and automatic currency formatting with useFormatUSDPrice hook
 * @param props - TableCell component props
 * @param props.value - Numeric value to format and display as USD price
 * @returns JSX element with formatted price display and responsive text sizing
 */
export function TableCell({ value }: { value: number }) {
	const formatUSDPrice = useFormatUSDPrice()

	return <div className='px-3 py-2 text-sm xl:text-base'>{formatUSDPrice(value, true)}</div>
}
