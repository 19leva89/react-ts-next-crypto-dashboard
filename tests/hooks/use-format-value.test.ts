import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useFormatValue } from '@/hooks/use-format-value'

describe('useFormatValue', () => {
	describe('basic functionality', () => {
		it('should format decimal value correctly with default parameters', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(100.5)

			expect(formatted).toBe('100,50')
		})

		it('should handle null and undefined values', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			expect(formatValue(null as any)).toBe('')
			expect(formatValue(undefined as any)).toBe('')
		})

		it('should handle zero value', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(0)

			expect(formatted).toBe('0,0')
		})

		it('should handle integer values correctly', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(100)

			expect(formatted).toBe('100,00')
		})
	})

	describe('decimal handling', () => {
		it('should show 2 decimal places for numbers >= 1', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1, expected: '1,00' },
				{ input: 1.5, expected: '1,50' },
				{ input: 123.456, expected: '123,46' }, // Should round to 2 decimals
				{ input: 999.99, expected: '999,99' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should show up to 9 decimal places for numbers < 1', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 0.1, expected: '0,1' },
				{ input: 0.123456789, expected: '0,123456789' },
				{ input: 0.5, expected: '0,5' },
				{ input: 0.999, expected: '0,999' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should handle very small numbers correctly', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 0.00001, expected: '0,00001' },
				{ input: 0.000123456789012, expected: '0,000123457' }, // Truncated to 9 decimals max
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})
	})

	describe('negative numbers', () => {
		it('should format negative numbers correctly', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: -100.5, expected: '-100,50' },
				{ input: -1, expected: '-1,00' },
				{ input: -0.5, expected: '-0,5' },
				{ input: -0.123, expected: '-0,123' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should use absolute value for decimal precision determination', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			// Negative number with absolute value >= 1 should have 2 decimal places
			const formatted1 = formatValue(-1.5)
			expect(formatted1).toBe('-1,50')

			// Negative number with absolute value < 1 should have up to 9 decimal places
			const formatted2 = formatValue(-0.123456)
			expect(formatted2).toBe('-0,123456')
		})
	})

	describe('useGrouping parameter', () => {
		it('should not use grouping by default', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1000, expected: '1000,00' },
				{ input: 1234567, expected: '1234567,00' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should use grouping when explicitly set to true', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1000, expected: '1 000,00' },
				{ input: 1000.5, expected: '1 000,50' },
				{ input: 1234567.89, expected: '1 234 567,89' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input, true)
				expect(formatted).toBe(expected)
			})
		})

		it('should not use grouping when explicitly set to false', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1000, expected: '1000,00' },
				{ input: 1234567.89, expected: '1234567,89' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input, false)
				expect(formatted).toBe(expected)
			})
		})
	})

	describe('locale parameter', () => {
		it('should use en-US locale by default', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(100.5)

			// The function should format according to en-US locale but with custom separators
			expect(formatted).toBe('100,50')
		})
	})

	describe('custom formatting (separator replacement)', () => {
		it('should replace non-breaking spaces with regular spaces', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(1000, true)

			// Should contain regular spaces, not non-breaking spaces
			expect(formatted).toBe('1 000,00')
			expect(formatted).not.toContain('\u00A0')
		})

		it('should replace periods with commas for decimal separator', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(100.5)

			expect(formatted).toContain(',50')
			expect(formatted).not.toContain('.50')
		})

		it('should replace commas with spaces for thousands separator', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(1000.5, true)

			expect(formatted).toBe('1 000,50')
		})

		it('should handle multiple replacements correctly', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const formatted = formatValue(1234567.89, true)

			// Should have spaces for thousands and comma for decimal
			expect(formatted).toBe('1 234 567,89')
			expect(formatted).not.toContain('.')
			expect(formatted.split(' ').length).toBe(3) // "1", "234", "567,89"
		})
	})

	describe('edge cases', () => {
		it('should handle very large numbers', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1000000.99, expected: '1 000 000,99', useGrouping: true },
				{ input: 1000000.99, expected: '1000000,99', useGrouping: false },
				{ input: Number.MAX_SAFE_INTEGER, expected: '9 007 199 254 740 991,00', useGrouping: true },
			]

			testCases.forEach(({ input, expected, useGrouping }) => {
				const formatted = formatValue(input, useGrouping)
				expect(formatted).toBe(expected)
			})
		})

		it('should handle numbers with many decimal places', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				// Numbers >= 1 should be limited to 2 decimal places
				{ input: 1.123456789012, expected: '1,12' },
				// Numbers < 1 should be limited to 9 decimal places
				{ input: 0.123456789012345, expected: '0,123456789' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should handle numbers close to 1', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 0.999999, expected: '0,999999' }, // < 1, up to 9 decimals
				{ input: 1.000001, expected: '1,00' }, // >= 1, exactly 2 decimals
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should handle very small positive and negative numbers', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 0.000000001, expected: '0,000000001' },
				{ input: -0.000000001, expected: '-0,000000001' },
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})
	})

	describe('rounding behavior', () => {
		it('should round correctly for numbers >= 1', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			const testCases = [
				{ input: 1.234, expected: '1,23' }, // Rounds down
				{ input: 1.235, expected: '1,24' }, // Rounds up (banker's rounding may vary)
				{ input: 1.999, expected: '2,00' }, // Rounds up
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})

		it('should handle precision for numbers < 1', () => {
			const { result } = renderHook(() => useFormatValue())
			const formatValue = result.current

			// These should not be rounded to 2 decimal places since they're < 1
			const testCases = [
				{ input: 0.123456789012345, expected: '0,123456789' }, // Truncated to 9 decimals
				{ input: 0.111111111111, expected: '0,111111111' }, // Truncated to 9 decimals
			]

			testCases.forEach(({ input, expected }) => {
				const formatted = formatValue(input)
				expect(formatted).toBe(expected)
			})
		})
	})

	describe('hook re-rendering', () => {
		it('should work correctly across re-renders', () => {
			const { result, rerender } = renderHook(() => useFormatValue())

			const firstFormatted = result.current(100.5)

			rerender()

			const secondFormatted = result.current(100.5)

			// The function should produce the same output across re-renders
			expect(firstFormatted).toBe(secondFormatted)
			expect(firstFormatted).toBe('100,50')
		})
	})
})
