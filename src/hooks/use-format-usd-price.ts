'use client'

import { useCallback } from 'react'

import { useCurrencyConverter } from '@/hooks/use-currency-converter'

export const useFormatUSDPrice = () => {
	const { fromUSD, selectedCurrency } = useCurrencyConverter()

	return useCallback(
		(usdPrice: number | null | undefined, useGrouping?: boolean, locale: string = 'en-US'): string => {
			if (usdPrice === undefined || usdPrice === null) {
				return ''
			}

			const convertedPrice = fromUSD(usdPrice)
			const absPrice = Math.abs(convertedPrice)
			const isLargeNumber = absPrice >= 1

			const formatter = new Intl.NumberFormat(locale, {
				style: 'currency',
				currency: selectedCurrency.toUpperCase(),
				currencyDisplay: 'narrowSymbol',
				useGrouping: useGrouping ?? false,
				minimumFractionDigits: isLargeNumber ? 2 : 1,
				maximumFractionDigits: isLargeNumber ? 2 : 9,
				notation: 'standard',
			})

			const parts = formatter.formatToParts(convertedPrice)

			return parts
				.map((p) => {
					if (p.type === 'group') return ' ' // Thousands separator
					if (p.type === 'decimal') return ',' // Fraction separator
					return p.value.replace(/\u00A0|\u202f/g, ' ') // If there is a non-breaking space
				})
				.join('')
		},

		[fromUSD, selectedCurrency],
	)
}
