import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { InputFormatPrice } from '@/components/shared/input-format-price'

// Mock UI components
vi.mock('@/components/ui', () => ({
	Input: ({ value, onChange, onFocus, onBlur, type, className }: any) => (
		<input
			data-testid='price-input'
			type={type}
			value={value}
			onChange={onChange}
			onFocus={onFocus}
			onBlur={onBlur}
			className={className}
		/>
	),
}))

// Mock custom hooks
const mockFormatValue = vi.fn()
const mockFromUSD = vi.fn()
const mockToUSD = vi.fn()

vi.mock('@/hooks/use-format-value', () => ({
	useFormatValue: () => mockFormatValue,
}))

vi.mock('@/hooks/use-currency-converter', () => ({
	useCurrencyConverter: () => ({
		fromUSD: mockFromUSD,
		toUSD: mockToUSD,
	}),
}))

describe('InputFormatPrice', () => {
	const mockOnChange = vi.fn()

	const defaultProps = {
		value: 100, // USD value from DB
		onChange: mockOnChange,
	}

	beforeEach(() => {
		// Setup default mock implementations
		mockFormatValue.mockImplementation((value: number) => `$${value.toFixed(2)}`)
		mockFromUSD.mockImplementation((usdValue: number) => usdValue * 1.2) // Mock EUR conversion
		mockToUSD.mockImplementation((localValue: number) => localValue / 1.2) // Mock EUR to USD conversion
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		it('should render input with formatted value when not editing', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			// Should call fromUSD to convert for display
			expect(mockFromUSD).toHaveBeenCalledWith(100)

			// Should format the converted value for display
			expect(mockFormatValue).toHaveBeenCalledWith(120) // 100 * 1.2

			// Should display formatted value
			expect(input).toHaveValue('$120.00')
		})

		it('should have correct input properties', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			expect(input).toHaveAttribute('type', 'text')
			expect(input).toHaveClass('[appearance:textfield]')
			expect(input).toHaveClass('rounded-xl')
			expect(input).toHaveClass('px-2')
			expect(input).toHaveClass('text-xs')
		})
	})

	describe('Focus Behavior', () => {
		it('should switch to editing mode and show raw value on focus', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			// Focus the input
			fireEvent.focus(input)

			// Should convert USD to display currency for editing
			expect(mockFromUSD).toHaveBeenCalledWith(100)

			// Should show raw converted value (not formatted)
			expect(input).toHaveValue('120') // 100 * 1.2, toString()
		})

		it('should handle zero value on focus', () => {
			render(<InputFormatPrice {...defaultProps} value={0} />)

			const input = screen.getByTestId('price-input')
			fireEvent.focus(input)

			expect(mockFromUSD).toHaveBeenCalledWith(0)
			expect(input).toHaveValue('0') // 0 * 1.2 = 0
		})

		it('should handle negative value on focus', () => {
			render(<InputFormatPrice {...defaultProps} value={-50} />)

			const input = screen.getByTestId('price-input')
			fireEvent.focus(input)

			expect(mockFromUSD).toHaveBeenCalledWith(-50)
			expect(input).toHaveValue('-60') // -50 * 1.2 = -60
		})
	})

	describe('Input Changes During Editing', () => {
		beforeEach(() => {
			render(<InputFormatPrice {...defaultProps} />)
			const input = screen.getByTestId('price-input')
			fireEvent.focus(input) // Enter editing mode
		})

		it('should update display value when typing valid numbers', () => {
			const input = screen.getByTestId('price-input')

			fireEvent.change(input, { target: { value: '150.50' } })

			expect(input).toHaveValue('150.50')
		})

		it('should allow negative numbers with minus at the beginning', () => {
			const input = screen.getByTestId('price-input')

			fireEvent.change(input, { target: { value: '-75.25' } })

			expect(input).toHaveValue('-75.25')
		})

		it('should remove minus signs that are not at the beginning', () => {
			const input = screen.getByTestId('price-input')

			fireEvent.change(input, { target: { value: '12-34-56' } })

			expect(input).toHaveValue('123456')
		})

		it('should handle multiple minus signs correctly', () => {
			const input = screen.getByTestId('price-input')

			fireEvent.change(input, { target: { value: '-12-34-' } })

			// When the first character is a minus, the component doesn't process the string
			// So it remains unchanged
			expect(input).toHaveValue('-12-34-')
		})

		it('should allow decimal numbers with comma or dot', () => {
			const input = screen.getByTestId('price-input')

			fireEvent.change(input, { target: { value: '123,45' } })
			expect(input).toHaveValue('123,45')

			fireEvent.change(input, { target: { value: '123.45' } })
			expect(input).toHaveValue('123.45')
		})
	})

	describe('Blur Behavior', () => {
		it('should convert value back to USD and call onChange on blur', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			// Focus and change value
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '240' } })

			// Blur to save
			fireEvent.blur(input)

			// Should convert local currency back to USD
			expect(mockToUSD).toHaveBeenCalledWith(240)

			// Should call onChange with USD value
			expect(mockOnChange).toHaveBeenCalledWith(200) // 240 / 1.2 = 200
		})

		it('should handle comma as decimal separator on blur', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '120,50' } })
			fireEvent.blur(input)

			// Should parse 120,50 as 120.50
			expect(mockToUSD).toHaveBeenCalledWith(120.5)
		})

		it('should handle invalid input by using 0 on blur', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: 'invalid text' } })
			fireEvent.blur(input)

			// Should use 0 for invalid input
			expect(mockToUSD).toHaveBeenCalledWith(0)
			expect(mockOnChange).toHaveBeenCalledWith(0)
		})

		it('should handle empty input by using 0 on blur', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '' } })
			fireEvent.blur(input)

			expect(mockToUSD).toHaveBeenCalledWith(0)
			expect(mockOnChange).toHaveBeenCalledWith(0)
		})

		it('should strip non-numeric characters except minus and decimal on blur', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '$123.45abc' } })
			fireEvent.blur(input)

			// Should parse as 123.45
			expect(mockToUSD).toHaveBeenCalledWith(123.45)
		})

		it('should exit editing mode and show formatted value after blur', async () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			// Focus, change, and blur
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '240' } })
			fireEvent.blur(input)

			// Should exit editing mode and show formatted value
			await waitFor(() => {
				// Should call formatValue with the converted value
				expect(mockFormatValue).toHaveBeenCalledWith(120) // fromUSD(100) = 120
				expect(input).toHaveValue('$120.00')
			})
		})
	})

	describe('Display Value Logic', () => {
		it('should show formatted value when not editing', () => {
			render(<InputFormatPrice {...defaultProps} value={250} />)

			const input = screen.getByTestId('price-input')

			// Should convert USD to display currency
			expect(mockFromUSD).toHaveBeenCalledWith(250)

			// Should format for display
			expect(mockFormatValue).toHaveBeenCalledWith(300) // 250 * 1.2

			expect(input).toHaveValue('$300.00')
		})

		it('should show raw value when editing', () => {
			render(<InputFormatPrice {...defaultProps} value={250} />)

			const input = screen.getByTestId('price-input')

			// Enter editing mode
			fireEvent.focus(input)

			// Should show raw converted value
			expect(input).toHaveValue('300') // 250 * 1.2, toString()

			// Change value
			fireEvent.change(input, { target: { value: '350.75' } })

			// Should show the typed value
			expect(input).toHaveValue('350.75')
		})
	})

	describe('Edge Cases', () => {
		it('should handle very large numbers', () => {
			render(<InputFormatPrice {...defaultProps} value={999999999} />)

			expect(mockFromUSD).toHaveBeenCalledWith(999999999)
		})

		it('should handle very small decimal numbers', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '0.001' } })
			fireEvent.blur(input)

			expect(mockToUSD).toHaveBeenCalledWith(0.001)
		})

		it('should handle multiple decimal points by using parseFloat logic', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '12.34.56' } })
			fireEvent.blur(input)

			// parseFloat('12.34.56') = 12.34
			expect(mockToUSD).toHaveBeenCalledWith(12.34)
		})

		it('should handle special float values', () => {
			render(<InputFormatPrice {...defaultProps} />)

			const input = screen.getByTestId('price-input')

			// Test with string that becomes NaN
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: 'abc' } })
			fireEvent.blur(input)

			expect(mockToUSD).toHaveBeenCalledWith(0)
		})
	})

	describe('Hook Integration', () => {
		it('should call currency converter hooks with correct values', () => {
			render(<InputFormatPrice {...defaultProps} value={150} />)

			// Initial render should call fromUSD
			expect(mockFromUSD).toHaveBeenCalledWith(150)

			const input = screen.getByTestId('price-input')

			// Focus should call fromUSD again
			fireEvent.focus(input)
			expect(mockFromUSD).toHaveBeenCalledWith(150)

			// Change and blur should call toUSD
			fireEvent.change(input, { target: { value: '180' } })
			fireEvent.blur(input)
			expect(mockToUSD).toHaveBeenCalledWith(180)
		})

		it('should call formatValue hook for display formatting', () => {
			render(<InputFormatPrice {...defaultProps} value={75} />)

			// Should format the converted value
			expect(mockFormatValue).toHaveBeenCalledWith(90) // 75 * 1.2
		})
	})

	describe('Props Changes', () => {
		it('should update display when value prop changes', () => {
			const { rerender } = render(<InputFormatPrice {...defaultProps} value={100} />)

			const input = screen.getByTestId('price-input')
			expect(input).toHaveValue('$120.00') // 100 * 1.2, formatted

			// Change the value prop
			rerender(<InputFormatPrice {...defaultProps} value={200} />)

			// Should update display with new value
			expect(mockFromUSD).toHaveBeenCalledWith(200)
			expect(input).toHaveValue('$240.00') // 200 * 1.2, formatted
		})

		it('should not affect editing state when props change during editing', () => {
			const { rerender } = render(<InputFormatPrice {...defaultProps} value={100} />)

			const input = screen.getByTestId('price-input')

			// Enter editing mode
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '999' } })

			// Change props while editing
			rerender(<InputFormatPrice {...defaultProps} value={200} />)

			// Should still show the user's input
			expect(input).toHaveValue('999')
		})
	})
})
