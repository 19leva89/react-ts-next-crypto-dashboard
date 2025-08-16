export const formatValue = (value: number, useGrouping?: boolean, locale: string = 'en-US'): string => {
	if (value === undefined || value === null) {
		return ''
	}

	const absPrice = Math.abs(value)
	const isLargeNumber = absPrice >= 1

	const formatted = value.toLocaleString(locale, {
		style: 'decimal',
		useGrouping: useGrouping ?? false,
		minimumFractionDigits: isLargeNumber ? 2 : 1,
		maximumFractionDigits: isLargeNumber ? 2 : 9,
		notation: 'standard',
	})

	const customFormatted = formatted
		.replace(/\u00A0/g, ' ') // If there is a non-breaking space
		.replace(/,/g, ' ') // Thousands separator
		.replace(/\./g, ',') // Fraction separator

	return customFormatted
}
