'use client'

import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { useSelectedCurrency } from '@/hooks/use-selected-currency'

export const useFormatPrice = () => {
	const trpc = useTRPC()

	const { currency: selectedCurrency } = useSelectedCurrency()
	const { data: exchangeRate } = useQuery(trpc.helpers.getExchangeRate.queryOptions())

	return (price: number, showCurrency: boolean = true, useGrouping?: boolean, locale?: string): string => {
		if (price === undefined || price === null) {
			return ''
		}

		const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
		const absPrice = Math.abs(price)
		const isLargeNumber = absPrice >= 1

		let finalPrice = price

		// If selected currency is not base currency, apply exchange rate
		if (selectedCurrency !== 'usd') {
			const rate = exchangeRate?.vsCurrencies?.[selectedCurrency as keyof typeof exchangeRate.vsCurrencies]

			if (rate) {
				finalPrice = price * rate
			}
		}

		return finalPrice.toLocaleString(userLocale, {
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
