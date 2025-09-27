'use client'

export const useFormatValue = () => {
	return (value: number | null | undefined, useGrouping?: boolean, locale: string = 'en-US'): string => {
		if (value === undefined || value === null) {
			return ''
		}

		const absValue = Math.abs(value)
		const isLargeNumber = absValue >= 1

		const formatted = value.toLocaleString(locale, {
			style: 'decimal',
			useGrouping: useGrouping ?? false,
			minimumFractionDigits: isLargeNumber ? 2 : 1,
			maximumFractionDigits: isLargeNumber ? 2 : 9,
			notation: 'standard',
		})

		let customFormatted = formatted
			.replace(/\u00A0/g, ' ') // If there is a non-breaking space
			.replace(/\u202f/g, ' ') // Narrow no-break space for some locales like fr-FR
			.replace(/,/g, ' ') // Thousands separator
			.replace(/\./g, ',') // Fraction separator

		if (isLargeNumber && locale.startsWith('fr-')) {
			customFormatted = customFormatted.replace(/ (\d{2})$/, ',$1')
		}

		return customFormatted
	}
}
