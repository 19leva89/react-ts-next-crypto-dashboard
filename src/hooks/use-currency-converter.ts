'use client'

import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { useSelectedCurrency } from '@/hooks/use-selected-currency'

export const useCurrencyConverter = () => {
	const trpc = useTRPC()

	const { currency: selectedCurrency } = useSelectedCurrency()
	const { data: exchangeRate } = useQuery(trpc.helpers.getExchangeRate.queryOptions())

	const getExchangeRate = () => {
		if (selectedCurrency === 'usd') return 1

		return exchangeRate?.vsCurrencies?.[selectedCurrency as keyof typeof exchangeRate.vsCurrencies] || 1
	}

	// Convert from USD to selected currency
	const fromUSD = (usdAmount: number): number => {
		const rate = getExchangeRate()

		return usdAmount * rate
	}

	// Convert from selected currency to USD for DB storage
	const toUSD = (localAmount: number): number => {
		const rate = getExchangeRate()

		return localAmount / rate
	}

	// Convert between any two currencies via USD
	const convert = (amount: number, fromCurrency: string, toCurrency: string): number => {
		if (fromCurrency === toCurrency) return amount

		// First convert to USD, then to target currency
		let usdAmount = amount
		if (fromCurrency !== 'usd') {
			const fromRate =
				exchangeRate?.vsCurrencies?.[fromCurrency as keyof typeof exchangeRate.vsCurrencies] || 1
			usdAmount = amount / fromRate
		}

		if (toCurrency === 'usd') return usdAmount

		const toRate = exchangeRate?.vsCurrencies?.[toCurrency as keyof typeof exchangeRate.vsCurrencies] || 1

		return usdAmount * toRate
	}

	return {
		fromUSD,
		toUSD,
		convert,
		selectedCurrency,
		exchangeRate: getExchangeRate(),
		isLoading: !exchangeRate,
	}
}
