export const formatPrice = (
	price: number,
	useGrouping?: boolean,
	minimumFractionDigits?: number,
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
		useGrouping: useGrouping || false,
		minimumFractionDigits: minimumFractionDigits || 1,
		maximumFractionDigits: maximumFractionDigits || 10,
		notation: 'standard',
	})
}
