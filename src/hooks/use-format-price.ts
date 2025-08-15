'use client'

import { useCurrencyConverter } from '@/hooks/use-currency-converter'

export const useFormatPrice = () => {
	const { selectedCurrency } = useCurrencyConverter()

	return (price: number, showCurrency: boolean = true, useGrouping?: boolean, locale?: string): string => {
		if (price === undefined || price === null) {
			return ''
		}

		const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
		const absPrice = Math.abs(price)
		const isLargeNumber = absPrice >= 1

		return price.toLocaleString(userLocale, {
			...(showCurrency
				? {
						style: 'currency',
						currency: selectedCurrency.toUpperCase(),
						currencyDisplay: 'symbol',
					}
				: { style: 'decimal' }),
			useGrouping: useGrouping ?? false,
			minimumFractionDigits: isLargeNumber ? 2 : 1,
			maximumFractionDigits: isLargeNumber ? 2 : 9,
			notation: 'standard',
		})
	}
}
