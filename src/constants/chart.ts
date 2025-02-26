import { ValidDays } from '@/app/api/constants'

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
