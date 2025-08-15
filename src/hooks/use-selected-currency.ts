import useLocalStorageState from 'use-local-storage-state'

const CURRENCY_KEY = 'selectedCurrency'

type Currency = 'usd' | 'eur' | 'uah'

export function useSelectedCurrency() {
	const [currency, setCurrency] = useLocalStorageState<Currency>(CURRENCY_KEY, {
		defaultValue: 'usd',
	})

	return {
		currency,
		changeCurrency: setCurrency,
	}
}
