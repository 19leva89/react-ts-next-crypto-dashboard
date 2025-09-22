import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { InputFormatQuantity } from '@/components/shared/input-format-quantity'

// Mock UI components
vi.mock('@/components/ui', () => ({
	Input: ({ value, onChange, onFocus, onBlur, type, className }: any) => (
		<input
			data-testid='quantity-input'
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

vi.mock('@/hooks/use-format-value', () => ({
	useFormatValue: () => mockFormatValue,
}))

describe('InputFormatQuantity', () => {
	const mockOnChange = vi.fn()

	const defaultProps = {
		value: 100,
		onChange: mockOnChange,
	}

	beforeEach(() => {
		// Setup default mock implementation that matches the real useFormatValue hook
		mockFormatValue.mockImplementation((value: number) => {
			if (value === undefined || value === null) {
				return ''
			}

			const absValue = Math.abs(value)
			const isLargeNumber = absValue >= 1

			const formatted = value.toLocaleString('en-US', {
				style: 'decimal',
				useGrouping: false, // Default useGrouping is false in the real hook
				minimumFractionDigits: isLargeNumber ? 2 : 1,
				maximumFractionDigits: isLargeNumber ? 2 : 9,
				notation: 'standard',
			})

			// Apply the same custom formatting as in the real hook
			const customFormatted = formatted
				.replace(/\u00A0/g, ' ') // If there is a non-breaking space
				.replace(/,/g, ' ') // Thousands separator
				.replace(/\./g, ',') // Fraction separator

			return customFormatted
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Initial Rendering', () => {
		it('should render input with formatted value when not editing', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			// Should format the value for display
			expect(mockFormatValue).toHaveBeenCalledWith(100)

			// Should display formatted value
			expect(input).toHaveValue('100,00')
		})

		it('should have correct input properties', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			expect(input).toHaveAttribute('type', 'text')
			expect(input).toHaveClass('[appearance:textfield]')
			expect(input).toHaveClass('rounded-xl')
			expect(input).toHaveClass('px-2')
			expect(input).toHaveClass('text-xs')
		})

		it('should initialize displayValue with value.toString()', () => {
			render(<InputFormatQuantity {...defaultProps} value={123.456} />)

			const input = screen.getByTestId('quantity-input')

			// Should show formatted value initially
			expect(input).toHaveValue('123,46') // formatted version
		})
	})

	describe('Focus Behavior', () => {
		it('should switch to editing mode and show raw value on focus', () => {
			render(<InputFormatQuantity {...defaultProps} value={1000} />)

			const input = screen.getByTestId('quantity-input')

			// Initially shows formatted value
			expect(input).toHaveValue('1000,00')

			// Focus the input
			fireEvent.focus(input)

			// Should show raw value for editing
			expect(input).toHaveValue('1000')
		})

		it('should handle zero value on focus', () => {
			render(<InputFormatQuantity {...defaultProps} value={0} />)

			const input = screen.getByTestId('quantity-input')
			fireEvent.focus(input)

			expect(input).toHaveValue('0')
		})

		it('should handle negative value on focus', () => {
			render(<InputFormatQuantity {...defaultProps} value={-50.25} />)

			const input = screen.getByTestId('quantity-input')
			fireEvent.focus(input)

			expect(input).toHaveValue('-50.25')
		})

		it('should handle decimal values on focus', () => {
			render(<InputFormatQuantity {...defaultProps} value={123.456789} />)

			const input = screen.getByTestId('quantity-input')
			fireEvent.focus(input)

			expect(input).toHaveValue('123.456789')
		})
	})

	describe('Input Changes During Editing', () => {
		beforeEach(() => {
			render(<InputFormatQuantity {...defaultProps} />)
			const input = screen.getByTestId('quantity-input')
			fireEvent.focus(input) // Enter editing mode
		})

		it('should update display value when typing valid numbers', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '150.75' } })

			expect(input).toHaveValue('150.75')
		})

		it('should allow negative numbers with minus at the beginning', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '-75.25' } })

			expect(input).toHaveValue('-75.25')
		})

		it('should remove minus signs that are not at the beginning', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '12-34-56' } })

			expect(input).toHaveValue('123456')
		})

		it('should handle multiple minus signs correctly', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '-12-34-' } })

			// When the first character is a minus, the component doesn't process the string
			// So it remains unchanged
			expect(input).toHaveValue('-12-34-')
		})

		it('should allow decimal numbers with comma or dot', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '123,45' } })
			expect(input).toHaveValue('123,45')

			fireEvent.change(input, { target: { value: '123.45' } })
			expect(input).toHaveValue('123.45')
		})

		it('should allow empty input during editing', () => {
			const input = screen.getByTestId('quantity-input')

			fireEvent.change(input, { target: { value: '' } })

			expect(input).toHaveValue('')
		})

		it('should allow partial numeric input', () => {
			const input = screen.getByTestId('quantity-input')

			// Test partial inputs that user might type
			fireEvent.change(input, { target: { value: '12.' } })
			expect(input).toHaveValue('12.')

			fireEvent.change(input, { target: { value: '.5' } })
			expect(input).toHaveValue('.5')

			fireEvent.change(input, { target: { value: '-' } })
			expect(input).toHaveValue('-')
		})
	})

	describe('Blur Behavior', () => {
		it('should parse value and call onChange on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			// Focus and change value
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '250.75' } })

			// Blur to save
			fireEvent.blur(input)

			expect(mockOnChange).toHaveBeenCalledWith(250.75)
		})

		it('should handle comma as decimal separator on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '120,50' } })
			fireEvent.blur(input)

			// Should parse 120,50 as 120.50
			expect(mockOnChange).toHaveBeenCalledWith(120.5)
		})

		it('should handle invalid input by using 0 on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: 'invalid text' } })
			fireEvent.blur(input)

			// Should use 0 for invalid input
			expect(mockOnChange).toHaveBeenCalledWith(0)
		})

		it('should handle empty input by using 0 on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '' } })
			fireEvent.blur(input)

			expect(mockOnChange).toHaveBeenCalledWith(0)
		})

		it('should strip non-numeric characters except minus and decimal on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: 'abc123.45def' } })
			fireEvent.blur(input)

			// Should parse as 123.45
			expect(mockOnChange).toHaveBeenCalledWith(123.45)
		})

		it('should handle negative values correctly on blur', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '-789.123' } })
			fireEvent.blur(input)

			expect(mockOnChange).toHaveBeenCalledWith(-789.123)
		})

		it('should exit editing mode and show formatted value after blur', async () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			// Focus, change, and blur
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '5000.123' } })
			fireEvent.blur(input)

			// Should call onChange with parsed value
			expect(mockOnChange).toHaveBeenCalledWith(5000.123)

			// Simulate parent component updating the prop (this is what would happen in real app)
			rerender(<InputFormatQuantity {...defaultProps} value={5000.123} />)

			// Should exit editing mode and show formatted value
			await waitFor(() => {
				// Should call formatValue with the new value
				expect(mockFormatValue).toHaveBeenCalledWith(5000.123)
				expect(input).toHaveValue('5000,12') // formatted version
			})
		})

		it('should update displayValue to parsed numeric string on blur', () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: 'abc123.45def' } })
			fireEvent.blur(input)

			// Should call onChange with parsed value
			expect(mockOnChange).toHaveBeenCalledWith(123.45)

			// Simulate parent component updating the prop
			rerender(<InputFormatQuantity {...defaultProps} value={123.45} />)

			// After blur, when focused again, should show the cleaned numeric value
			fireEvent.focus(input)
			expect(input).toHaveValue('123.45')
		})
	})

	describe('Display Value Logic', () => {
		it('should show formatted value when not editing', () => {
			render(<InputFormatQuantity {...defaultProps} value={2500.456} />)

			const input = screen.getByTestId('quantity-input')

			expect(mockFormatValue).toHaveBeenCalledWith(2500.456)
			expect(input).toHaveValue('2500,46')
		})

		it('should show raw value when editing', () => {
			render(<InputFormatQuantity {...defaultProps} value={2500.456} />)

			const input = screen.getByTestId('quantity-input')

			// Enter editing mode
			fireEvent.focus(input)

			// Should show raw value
			expect(input).toHaveValue('2500.456')

			// Change value
			fireEvent.change(input, { target: { value: '3000.789' } })

			// Should show the typed value
			expect(input).toHaveValue('3000.789')
		})
	})

	describe('Edge Cases', () => {
		it('should handle very large numbers', () => {
			render(<InputFormatQuantity {...defaultProps} value={999999999.123456} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			expect(input).toHaveValue('999999999.123456')
		})

		it('should handle very small decimal numbers', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '0.000001' } })
			fireEvent.blur(input)

			expect(mockOnChange).toHaveBeenCalledWith(0.000001)
		})

		it('should handle multiple decimal points by using parseFloat logic', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '12.34.56' } })
			fireEvent.blur(input)

			// parseFloat('12.34.56') = 12.34
			expect(mockOnChange).toHaveBeenCalledWith(12.34)
		})

		it('should handle special characters and symbols', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '$123.45€' } })
			fireEvent.blur(input)

			// Should strip currency symbols
			expect(mockOnChange).toHaveBeenCalledWith(123.45)
		})

		it('should handle exponential notation', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '1.23e5' } })
			fireEvent.blur(input)

			// Should handle scientific notation - but parseFloat with regex might not work as expected
			// The regex /[^0-9.-]/g would remove 'e', so it becomes '1.235'
			expect(mockOnChange).toHaveBeenCalledWith(1.235)
		})

		it('should handle only minus sign', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '-' } })
			fireEvent.blur(input)

			// parseFloat('-') = NaN, so should default to 0
			expect(mockOnChange).toHaveBeenCalledWith(0)
		})

		it('should handle only decimal point', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '.' } })
			fireEvent.blur(input)

			// parseFloat('.') = NaN, so should default to 0
			expect(mockOnChange).toHaveBeenCalledWith(0)
		})
	})

	describe('Hook Integration', () => {
		it('should call formatValue hook with correct values', () => {
			render(<InputFormatQuantity {...defaultProps} value={150.789} />)

			// Should be called on initial render
			expect(mockFormatValue).toHaveBeenCalledWith(150.789)

			const input = screen.getByTestId('quantity-input')

			// Enter editing mode (formatValue should not be called during editing)
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '200.456' } })

			// Clear previous calls to track only blur-related calls
			mockFormatValue.mockClear()

			// Exit editing mode - this should trigger onChange and re-render with formatted value
			fireEvent.blur(input)

			// Should call onChange with parsed value
			expect(mockOnChange).toHaveBeenCalledWith(200.456)

			// After blur, component exits editing mode and should format the current prop value (still 150.789)
			// because in this test the prop doesn't actually change
			expect(mockFormatValue).toHaveBeenCalledWith(150.789)
		})

		it('should format new prop value when prop changes', () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} value={150.789} />)

			// Clear initial calls
			mockFormatValue.mockClear()

			// Change the prop value
			rerender(<InputFormatQuantity {...defaultProps} value={200.456} />)

			// Should format the new prop value
			expect(mockFormatValue).toHaveBeenCalledWith(200.456)
		})
	})

	describe('Props Changes', () => {
		it('should update display when value prop changes', () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} value={100} />)

			const input = screen.getByTestId('quantity-input')
			expect(input).toHaveValue('100,00')

			// Change the value prop
			rerender(<InputFormatQuantity {...defaultProps} value={250.75} />)

			// Should update display with new value
			expect(mockFormatValue).toHaveBeenCalledWith(250.75)
			expect(input).toHaveValue('250,75')
		})

		it('should not affect editing state when props change during editing', () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} value={100} />)

			const input = screen.getByTestId('quantity-input')

			// Enter editing mode
			fireEvent.focus(input)
			fireEvent.change(input, { target: { value: '999.123' } })

			// Change props while editing
			rerender(<InputFormatQuantity {...defaultProps} value={200} />)

			// Should still show the user's input
			expect(input).toHaveValue('999.123')
		})

		it('should update internal state when value prop changes and not editing', () => {
			const { rerender } = render(<InputFormatQuantity {...defaultProps} value={100} />)

			// Change the value prop
			rerender(<InputFormatQuantity {...defaultProps} value={300.456} />)

			const input = screen.getByTestId('quantity-input')

			// Focus to enter editing mode - should show the new prop value
			fireEvent.focus(input)
			expect(input).toHaveValue('300.456')
		})
	})

	describe('CSS Classes', () => {
		it('should apply all required CSS classes', () => {
			render(<InputFormatQuantity {...defaultProps} />)

			const input = screen.getByTestId('quantity-input')

			// Check specific classes
			expect(input).toHaveClass('[appearance:textfield]')
			expect(input).toHaveClass('rounded-xl')
			expect(input).toHaveClass('px-2')
			expect(input).toHaveClass('text-xs')
			expect(input).toHaveClass('sm:text-sm')
			expect(input).toHaveClass('lg:px-3')
			expect(input).toHaveClass('lg:text-base')
			expect(input).toHaveClass('[&::-webkit-inner-spin-button]:appearance-none')
			expect(input).toHaveClass('[&::-webkit-outer-spin-button]:appearance-none')
		})
	})
})
