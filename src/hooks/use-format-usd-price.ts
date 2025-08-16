'use client'

import { useCurrencyConverter } from '@/hooks/use-currency-converter'

export const useFormatUSDPrice = () => {
	const { fromUSD, selectedCurrency } = useCurrencyConverter()

	return (usdPrice: number, useGrouping?: boolean, locale: string = 'en-US'): string => {
		if (usdPrice === undefined || usdPrice === null) {
			return ''
		}

		const convertedPrice = fromUSD(usdPrice)
		const absPrice = Math.abs(convertedPrice)
		const isLargeNumber = absPrice >= 1

		const formatted = convertedPrice.toLocaleString(locale, {
			style: 'currency',
			currency: selectedCurrency.toUpperCase(),
			currencyDisplay: 'narrowSymbol',
			useGrouping: useGrouping ?? false,
			minimumFractionDigits: isLargeNumber ? 2 : 1,
			maximumFractionDigits: isLargeNumber ? 2 : 9,
			notation: 'standard',
		})

		const customFormatted = formatted
			.replace(/\u00A0/g, ' ') // If there is a non-breaking space
			.replace(/,/g, ' ') // Thousands separator
			.replace(/\./g, ',') // Fraction separator

		return customFormatted
	}
}
