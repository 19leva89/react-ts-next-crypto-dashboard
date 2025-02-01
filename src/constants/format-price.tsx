export const formatPrice = (
	price: number,
	useGrouping?: boolean,
	maximumFractionDigits?: number,
	locale?: string,
): string => {
	// Если значение price не задано, возвращаем пустую строку
	if (price === undefined || price === null) {
		return ''
	}

	// Если locale не передан, попробуем получить из navigator
	const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')

	return price.toLocaleString(userLocale, {
		currencyDisplay: 'symbol',
		minimumFractionDigits: 1,
		maximumFractionDigits: maximumFractionDigits || 10,
		useGrouping: useGrouping || false,
		notation: 'standard',
	})
}
