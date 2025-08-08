import { MarketChart } from '@prisma/client'

import { DAYS_MAPPING, ValidDays } from '@/app/api/constants'

export const getFieldForDays = (days: number): keyof MarketChart | null => {
	return (DAYS_MAPPING[days as ValidDays] as keyof MarketChart) || null
}
