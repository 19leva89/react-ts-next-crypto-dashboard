export const CURRENCIES = ['usd', 'eur', 'uah'] as const

export type Currency = (typeof CURRENCIES)[number]
