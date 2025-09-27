import { describe, it, expect } from 'vitest'

import { formatValue } from '@/lib/format-value'

describe('formatValue', () => {
	// Test handling of invalid inputs
	describe('handles invalid inputs', () => {
		it('returns empty string for undefined', () => {
			expect(formatValue(undefined)).toBe('')
		})

		it('returns empty string for null', () => {
			expect(formatValue(null)).toBe('')
		})
	})

	// Test formatting for large numbers (abs(value) >= 1)
	describe('formats large numbers', () => {
		it('formats positive integer to two decimal places without grouping', () => {
			expect(formatValue(1000)).toBe('1000,00')
		})

		it('formats negative integer to two decimal places without grouping', () => {
			expect(formatValue(-1000)).toBe('-1000,00')
		})

		it('formats positive decimal to two decimal places without grouping', () => {
			expect(formatValue(1234.56)).toBe('1234,56')
		})

		it('formats negative decimal to two decimal places without grouping', () => {
			expect(formatValue(-1234.56)).toBe('-1234,56')
		})

		it('rounds positive decimal to two decimal places without grouping', () => {
			expect(formatValue(1234.56789)).toBe('1234,57')
		})

		it('formats with grouping using space as thousands separator', () => {
			expect(formatValue(1234.56, true)).toBe('1 234,56')
		})

		it('formats negative with grouping', () => {
			expect(formatValue(-1234.56, true)).toBe('-1 234,56')
		})

		it('rounds with grouping', () => {
			expect(formatValue(1234.56789, true)).toBe('1 234,57')
		})
	})

	// Test formatting for small numbers (abs(value) < 1)
	describe('formats small numbers', () => {
		it('formats zero with one decimal place', () => {
			expect(formatValue(0)).toBe('0,0')
		})

		it('formats positive fraction with preserved decimals without trailing zeros', () => {
			expect(formatValue(0.5)).toBe('0,5')
		})

		it('formats negative fraction without trailing zeros', () => {
			expect(formatValue(-0.5)).toBe('-0,5')
		})

		it('preserves up to 9 decimal places', () => {
			expect(formatValue(0.123456789)).toBe('0,123456789')
		})

		it('formats very small number with all decimals', () => {
			expect(formatValue(0.000000001)).toBe('0,000000001')
		})

		it('formats negative very small number', () => {
			expect(formatValue(-0.000000001)).toBe('-0,000000001')
		})
	})

	// Test locale variations (note: custom replaces assume en-US format, may alter other locales)
	describe('handles different locales', () => {
		it('uses en-US as default', () => {
			expect(formatValue(1234.56, true, 'en-US')).toBe('1 234,56')
		})

		it('applies custom formatting to fr-FR (thousands space, decimal comma)', () => {
			// In fr-FR: original "1.234,56" -> replace ',' with ' ' -> "1 234,56"
			expect(formatValue(1234.56, true, 'fr-FR')).toBe('1 234,56')
		})

		it('applies custom formatting to de-DE (may alter due to different separators)', () => {
			// In de-DE: original "1.234,56" -> replace ',' with ' ' -> "1.234 56" -> replace '.' with ',' -> "1,234 56"
			expect(formatValue(1234.56, true, 'de-DE')).toBe('1,234 56')
		})

		it('formats small number in de-DE', () => {
			// In de-DE: original "0,5" -> replace ',' with ' ' -> "0 5" -> no '.' -> "0 5"
			expect(formatValue(0.5, false, 'de-DE')).toBe('0 5')
		})
	})
})
