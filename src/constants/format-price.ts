export const formatPrice = (price: number, useGrouping?: boolean, locale?: string): string => {
	// Если значение price не задано, возвращаем пустую строку
	if (price === undefined || price === null) {
		return ''
	}

	// Если locale не передан, попробуем получить из navigator
	const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')

	// Определяем количество знаков после запятой
	let formattedPrice: string

	if (price >= 1) {
		// Для чисел >= 1 округляем до 2 знаков после запятой
		formattedPrice = price.toLocaleString(userLocale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})
	} else {
		// Для чисел < 1 убираем лишние нули в конце
		formattedPrice = parseFloat(price.toFixed(10)).toString() // Убираем лишние нули
		formattedPrice = parseFloat(formattedPrice).toLocaleString(userLocale, {
			minimumFractionDigits: 1,
			maximumFractionDigits: 10,
		})
	}

	return price.toLocaleString(userLocale, {
		currencyDisplay: 'symbol',
		useGrouping: useGrouping || false,
		minimumFractionDigits: price >= 1 ? 2 : 1,
		maximumFractionDigits: price >= 1 ? 2 : 10,
		notation: 'standard',
	})
}
