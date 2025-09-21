import useLocalStorageState from 'use-local-storage-state'

const CURRENCY_KEY = 'selectedCurrency'

type Currency = 'usd' | 'eur' | 'uah'

/**
 * Custom hook for managing selected currency with persistent localStorage storage
 * Provides currency state management with automatic persistence and USD as default fallback
 * Uses useLocalStorageState for seamless localStorage integration and state synchronization
 * @returns Object with currency (current selected currency, defaults to 'usd') and changeCurrency (function to update selected currency with localStorage persistence)
 */
export function useSelectedCurrency() {
	const [currency, setCurrency] = useLocalStorageState<Currency>(CURRENCY_KEY, {
		defaultValue: 'usd',
	})

	return {
		currency,
		changeCurrency: setCurrency,
	}
}
