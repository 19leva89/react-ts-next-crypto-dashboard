export const formatValue = (
	value: number | null | undefined,
	useGrouping?: boolean,
	locale: string = 'en-US',
): string => {
	if (value === undefined || value === null) {
		return ''
	}

	const absPrice = Math.abs(value)
	const isLargeNumber = absPrice >= 1

	const formatter = new Intl.NumberFormat(locale, {
		style: 'decimal',
		useGrouping: useGrouping ?? false,
		minimumFractionDigits: isLargeNumber ? 2 : 1,
		maximumFractionDigits: isLargeNumber ? 2 : 9,
		notation: 'standard',
	})
	const parts = formatter.formatToParts(value)
	return parts
		.map((p) => {
			if (p.type === 'group') return ' ' // Thousands separator
			if (p.type === 'decimal') return ',' // Fraction separator
			return p.value.replace(/\u00A0|\u202f/g, ' ') // If there is a non-breaking space
		})
		.join('')
}
