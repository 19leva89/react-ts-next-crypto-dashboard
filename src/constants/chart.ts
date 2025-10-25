import { MarketChart } from '../../prisma/generated'

export type ValidDays = keyof typeof DAYS_MAPPING
export const DAYS_MAPPING: { [key: number]: keyof MarketChart } = {
	1: 'prices_1d',
	7: 'prices_7d',
	30: 'prices_30d',
	365: 'prices_365d',
} as const

export const DAY_OPTIONS: { label: string; value: ValidDays }[] = [
	{ label: '1 day', value: 1 },
	{ label: '1 week', value: 7 },
	{ label: '1 month', value: 30 },
	{ label: '1 year', value: 365 },
]

export const MONTH_OPTIONS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]
