export const formatPrice = (price: number, useGrouping?: boolean, locale?: string): string => {
	if (price === undefined || price === null) {
		return ''
	}

	const userLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US')
	const absPrice = Math.abs(price)
	const isLargeNumber = absPrice >= 1

	return price.toLocaleString(userLocale, {
		currencyDisplay: 'symbol',
		useGrouping: useGrouping ?? false,
		minimumFractionDigits: isLargeNumber ? 2 : 1,
		maximumFractionDigits: isLargeNumber ? 2 : 9,
		notation: 'standard',
	})
}
