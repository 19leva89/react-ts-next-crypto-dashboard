import { z } from 'zod'

export const userChartDataPointSchema = z.object({
	timestamp: z.date(),
	value: z.number(),
})

export const portfolioDataSchema = z.object({
	name: z.string(),
	value: z.number(),
	symbol: z.string(),
	percentage: z.number(),
})

export const pieChartDataSchema = portfolioDataSchema.extend({
	fill: z.string(),
})

export const lineChartDataSchema = z.object({
	timestamp: z.string(),
	value: z.number(),
})

export const portfolioChartResponseSchema = z.object({
	totalInvestedValue: z.number(),
	totalPortfolioValue: z.number(),
	plannedProfit: z.number(),
	lineChartData: z.array(lineChartDataSchema),
	pieChartData: z.array(pieChartDataSchema),
})

export type UserChartDataPoint = z.infer<typeof userChartDataPointSchema>
export type PortfolioData = z.infer<typeof portfolioDataSchema>
export type PieChartData = z.infer<typeof pieChartDataSchema>
export type LineChartData = z.infer<typeof lineChartDataSchema>
export type PortfolioChartResponse = z.infer<typeof portfolioChartResponseSchema>
