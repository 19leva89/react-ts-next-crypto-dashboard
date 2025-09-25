import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'

// Mock the currency converter hook
const mockFromUSD = vi.fn()
const mockUseCurrencyConverter = {
	fromUSD: mockFromUSD,
	selectedCurrency: 'USD',
}

vi.mock('@/hooks/use-currency-converter', () => ({
	useCurrencyConverter: () => mockUseCurrencyConverter,
}))

describe('useFormatUSDPrice', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset to default values
		mockUseCurrencyConverter.selectedCurrency = 'USD'
		mockFromUSD.mockImplementation((price: number) => price)
	})

	describe('basic functionality', () => {
		it('should format USD price correctly with default parameters', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(100.5)

			const formatted = formatPrice(100.5)

			expect(mockFromUSD).toHaveBeenCalledWith(100.5)
			expect(formatted).toBe('$100,50')
		})

		it('should handle null and undefined values', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			expect(formatPrice(null as any)).toBe('')
			expect(formatPrice(undefined as any)).toBe('')
		})

		it('should handle zero value', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(0)

			const formatted = formatPrice(0)

			expect(formatted).toBe('$0,0')
		})
	})

	describe('currency conversion', () => {
		it('should use converted price from fromUSD function', () => {
			mockUseCurrencyConverter.selectedCurrency = 'EUR'
			mockFromUSD.mockReturnValue(85.3)

			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			const formatted = formatPrice(100)

			expect(mockFromUSD).toHaveBeenCalledWith(100)
			expect(formatted).toBe('€85,30')
		})

		it('should format different currencies correctly', () => {
			const testCases = [
				{ currency: 'GBP', convertedPrice: 75.25, expected: '£75,25' },
				{ currency: 'JPY', convertedPrice: 11000, expected: '¥11000,00' },
				{ currency: 'CAD', convertedPrice: 125.75, expected: '$125,75' },
			]

			testCases.forEach(({ currency, convertedPrice, expected }) => {
				mockUseCurrencyConverter.selectedCurrency = currency
				mockFromUSD.mockReturnValue(convertedPrice)

				const { result } = renderHook(() => useFormatUSDPrice())
				const formatPrice = result.current

				const formatted = formatPrice(100)
				expect(formatted).toBe(expected)
			})
		})
	})

	describe('decimal handling', () => {
		it('should show 2 decimal places for numbers >= 1', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			// Test case where converted price is >= 1
			mockFromUSD.mockReturnValue(1.5)

			const formatted = formatPrice(1.5)

			expect(formatted).toBe('$1,50')
		})

		it('should show up to 9 decimal places for numbers < 1', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			// Test case where converted price is < 1
			mockFromUSD.mockReturnValue(0.123456789)

			const formatted = formatPrice(1.0)

			expect(formatted).toBe('$0,123456789')
		})

		it('should handle very small numbers correctly', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(0.00001)

			const formatted = formatPrice(1.0)

			expect(formatted).toBe('$0,00001')
		})
	})

	describe('negative numbers', () => {
		it('should format negative numbers correctly', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(-100.5)

			const formatted = formatPrice(-100.5)

			expect(formatted).toBe('-$100,50')
		})

		it('should use absolute value for decimal precision determination', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			// Negative number with absolute value >= 1 should have 2 decimal places
			mockFromUSD.mockReturnValue(-1.5)

			const formatted = formatPrice(-1.5)

			expect(formatted).toBe('-$1,50')
		})

		it('should handle negative small numbers correctly', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			// Negative number with absolute value < 1 should have up to 9 decimal places
			mockFromUSD.mockReturnValue(-0.123456)

			const formatted = formatPrice(-1.0)

			expect(formatted).toBe('-$0,123456')
		})
	})

	describe('useGrouping parameter', () => {
		it('should not use grouping by default', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000.5)

			const formatted = formatPrice(1000.5)

			expect(formatted).toBe('$1000,50')
		})

		it('should use grouping when explicitly set to true', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000.5)

			const formatted = formatPrice(1000.5, true)

			expect(formatted).toBe('$1 000,50')
		})

		it('should not use grouping when explicitly set to false', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000.5)

			const formatted = formatPrice(1000.5, false)

			expect(formatted).toBe('$1000,50')
		})
	})

	describe('locale parameter', () => {
		it('should use en-US locale by default', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(100.5)

			const formatted = formatPrice(100.5)

			// The function should format according to en-US locale but with custom separators
			expect(formatted).toBe('$100,50')
		})
	})

	describe('custom formatting (separator replacement)', () => {
		it('should replace non-breaking spaces with regular spaces', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000)

			const formatted = formatPrice(1000, true)

			// Should contain regular spaces, not non-breaking spaces
			expect(formatted).toBe('$1 000,00')
			expect(formatted).not.toContain('\u00A0')
		})

		it('should replace periods with commas for decimal separator', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(100.5)

			const formatted = formatPrice(100.5)

			expect(formatted).toContain(',50')
			expect(formatted).not.toContain('.50')
		})

		it('should replace commas with spaces for thousands separator', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000.5)

			const formatted = formatPrice(1000.5, true)

			expect(formatted).toBe('$1 000,50')
		})
	})

	describe('edge cases', () => {
		it('should handle very large numbers', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(1000000.99)

			const formatted = formatPrice(1000000.99, true)

			expect(formatted).toBe('$1 000 000,99')
		})

		it('should handle numbers with many decimal places', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(0.123456789012)

			const formatted = formatPrice(1.0)

			// Should be truncated to 9 decimal places max
			expect(formatted).toBe('$0,123456789')
		})

		it('should handle integer values correctly', () => {
			const { result } = renderHook(() => useFormatUSDPrice())
			const formatPrice = result.current

			mockFromUSD.mockReturnValue(100)

			const formatted = formatPrice(100)

			expect(formatted).toBe('$100,00')
		})
	})

	describe('hook re-rendering', () => {
		it('should maintain function reference stability', () => {
			const { result, rerender } = renderHook(() => useFormatUSDPrice())

			const firstRender = result.current

			rerender()

			const secondRender = result.current

			// The function should be the same reference (memoized)
			expect(firstRender).toBe(secondRender)
		})
	})
})
