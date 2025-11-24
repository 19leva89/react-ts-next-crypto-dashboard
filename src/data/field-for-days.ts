import { MarketChart } from '@/generated/prisma/client'
import { DAYS_MAPPING, ValidDays } from '@/constants/chart'

export const getFieldForDays = (days: number): keyof MarketChart | null => {
	return (DAYS_MAPPING[days as ValidDays] as keyof MarketChart) || null
}
