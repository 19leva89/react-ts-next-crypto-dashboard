import useLocalStorageState from 'use-local-storage-state'
import { DollarSignIcon, EuroIcon, BanknoteIcon } from 'lucide-react'

import { Currency } from '@/constants/currency'

export const CURRENCY_KEY = 'selectedCurrency'

/**
 * Custom hook for managing selected currency with persistent localStorage storage
 * Provides currency state management with automatic persistence and USD as default fallback
 * Uses useLocalStorageState for seamless localStorage integration and state synchronization
 * @returns Object with currency (current selected currency, defaults to 'usd'), changeCurrency (function to update selected currency with localStorage persistence), and currencyIcon (the appropriate Lucide icon component based on the selected currency)
 */
export function useSelectedCurrency() {
	const [currency, setCurrency] = useLocalStorageState<Currency>(CURRENCY_KEY, {
		defaultValue: 'usd',
	})

	const getCurrencyIcon = (cur: Currency) => {
		switch (cur) {
			case 'usd':
				return DollarSignIcon

			case 'eur':
				return EuroIcon

			case 'uah':
				return BanknoteIcon

			default:
				return BanknoteIcon
		}
	}

	const CurrencyIcon = getCurrencyIcon(currency)

	return {
		currency,
		CurrencyIcon,
		changeCurrency: setCurrency,
	}
}
