import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FormInput } from '@/components/shared/form/form-input'

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
	useFormContext: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	Input: ({ children, ...props }: any) => (
		<input data-testid='form-input' {...props}>
			{children}
		</input>
	),
}))

// Mock shared components
vi.mock('@/components/shared', () => ({
	ClearButton: ({ onClick, ...props }: any) => (
		<button data-testid='clear-button' onClick={onClick} {...props}>
			Clear
		</button>
	),
	ErrorText: ({ text, className, ...props }: any) => (
		<div data-testid='error-text' className={className} {...props}>
			{text}
		</div>
	),
	RequiredSymbol: (props: any) => (
		<span data-testid='required-symbol' {...props}>
			*
		</span>
	),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
	EyeIcon: (props: any) => <div data-testid='eye-icon' {...props} />,
	EyeOffIcon: (props: any) => <div data-testid='eye-off-icon' {...props} />,
}))

describe('FormInput', () => {
	let mockRegister: ReturnType<typeof vi.fn>
	let mockWatch: ReturnType<typeof vi.fn>
	let mockSetValue: ReturnType<typeof vi.fn>
	let mockFormState: {
		errors: Record<string, any>
		isDirty: boolean
		isLoading: boolean
		isSubmitted: boolean
		isSubmitSuccessful: boolean
		isSubmitting: boolean
		isValidating: boolean
		isValid: boolean
		isReady: boolean
		disabled: boolean
		submitCount: number
		defaultValues?: any
		dirtyFields: Record<string, any>
		touchedFields: Record<string, any>
		validatingFields: Record<string, any>
	}
	let mockUseFormContext: ReturnType<typeof vi.mocked<typeof useFormContext>>

	const defaultProps = {
		name: 'testField',
		type: 'text',
		placeholder: 'Enter text',
	}

	beforeEach(() => {
		// Create fresh mocks for each test
		mockRegister = vi.fn((name: string) => ({
			name,
			onChange: vi.fn(),
			onBlur: vi.fn(),
			ref: vi.fn(),
		}))
		mockWatch = vi.fn(() => '')
		mockSetValue = vi.fn()
		mockFormState = {
			errors: {},
			isDirty: false,
			isLoading: false,
			isSubmitted: false,
			isSubmitSuccessful: false,
			isSubmitting: false,
			isValidating: false,
			isValid: true,
			isReady: true,
			disabled: false,
			submitCount: 0,
			dirtyFields: {},
			touchedFields: {},
			validatingFields: {},
		}

		// Mock useFormContext return value
		mockUseFormContext = vi.mocked(useFormContext)
		mockUseFormContext.mockReturnValue({
			register: mockRegister as any, // Type assertion to handle complex generic types
			formState: mockFormState as any, // Type assertion for FormState compatibility
			watch: mockWatch,
			setValue: mockSetValue,
			// Add other required properties with default values
			control: {} as any,
			handleSubmit: vi.fn(),
			reset: vi.fn(),
			resetField: vi.fn(),
			setError: vi.fn(),
			clearErrors: vi.fn(),
			trigger: vi.fn(),
			getValues: vi.fn(),
			getFieldState: vi.fn(),
			setFocus: vi.fn(),
			unregister: vi.fn(),
			subscribe: vi.fn(),
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('basic rendering', () => {
		it('should render input with basic props', () => {
			render(<FormInput {...defaultProps} />)

			const input = screen.getByTestId('form-input')
			expect(input).toBeInTheDocument()
			expect(input).toHaveAttribute('type', 'text')
			expect(input).toHaveAttribute('placeholder', 'Enter text')
		})

		it('should register field with react-hook-form', () => {
			render(<FormInput {...defaultProps} />)

			expect(mockRegister).toHaveBeenCalledWith('testField')
		})

		it('should watch field value', () => {
			render(<FormInput {...defaultProps} />)

			expect(mockWatch).toHaveBeenCalledWith('testField')
		})

		it('should apply custom className to container', () => {
			const { container } = render(<FormInput {...defaultProps} className='custom-class' />)

			expect(container.firstChild).toHaveClass('custom-class')
		})

		it('should pass through additional HTML input attributes', () => {
			render(<FormInput {...defaultProps} disabled maxLength={10} autoComplete='off' />)

			const input = screen.getByTestId('form-input')
			expect(input).toBeDisabled()
			expect(input).toHaveAttribute('maxLength', '10')
			expect(input).toHaveAttribute('autoComplete', 'off')
		})
	})

	describe('label rendering', () => {
		it('should render label when provided', () => {
			render(<FormInput {...defaultProps} label='Test Label' />)

			expect(screen.getByText('Test Label')).toBeInTheDocument()
		})

		it('should not render label when not provided', () => {
			render(<FormInput {...defaultProps} />)

			// Should not find any paragraph with label content
			expect(screen.queryByText(/Test Label/)).not.toBeInTheDocument()
		})

		it('should render required symbol when required is true', () => {
			render(<FormInput {...defaultProps} label='Test Label' required />)

			expect(screen.getByText('Test Label')).toBeInTheDocument()
			expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
		})

		it('should not render required symbol when required is false', () => {
			render(<FormInput {...defaultProps} label='Test Label' required={false} />)

			expect(screen.getByText('Test Label')).toBeInTheDocument()
			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should not render required symbol when required is undefined', () => {
			render(<FormInput {...defaultProps} label='Test Label' />)

			expect(screen.getByText('Test Label')).toBeInTheDocument()
			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})
	})

	describe('password field functionality', () => {
		it('should render password field with hidden text initially', () => {
			render(<FormInput {...defaultProps} type='password' />)

			const input = screen.getByTestId('form-input')
			expect(input).toHaveAttribute('type', 'password')
		})

		it('should show eye icon for password visibility toggle', () => {
			render(<FormInput {...defaultProps} type='password' />)

			expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
			expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument()
		})

		it('should toggle password visibility when eye button is clicked', async () => {
			const user = userEvent.setup()
			render(<FormInput {...defaultProps} type='password' />)

			const toggleButton = screen.getByRole('button')
			const input = screen.getByTestId('form-input')

			// Initially password should be hidden
			expect(input).toHaveAttribute('type', 'password')
			expect(screen.getByTestId('eye-icon')).toBeInTheDocument()

			// Click to show password
			await user.click(toggleButton)

			expect(input).toHaveAttribute('type', 'text')
			expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
			expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()

			// Click again to hide password
			await user.click(toggleButton)

			expect(input).toHaveAttribute('type', 'password')
			expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
			expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument()
		})

		it('should not show clear button for password fields', () => {
			mockWatch.mockReturnValue('some password')
			render(<FormInput {...defaultProps} type='password' />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should have correct button styling for password toggle', () => {
			render(<FormInput {...defaultProps} type='password' />)

			const toggleButton = screen.getByRole('button')
			expect(toggleButton).toHaveClass(
				'absolute',
				'top-1/2',
				'right-4',
				'-translate-y-1/2',
				'transform',
				'cursor-pointer',
				'opacity-30',
				'transition-opacity',
				'duration-300',
				'ease-in-out',
				'hover:opacity-100',
			)
		})
	})

	describe('clear button functionality', () => {
		it('should show clear button for non-password fields with value', () => {
			mockWatch.mockReturnValue('some text')
			render(<FormInput {...defaultProps} type='text' />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
		})

		it('should not show clear button for empty fields', () => {
			mockWatch.mockReturnValue('')
			render(<FormInput {...defaultProps} type='text' />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should not show clear button for null/undefined values', () => {
			mockWatch.mockReturnValue(null)
			render(<FormInput {...defaultProps} type='text' />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()

			mockWatch.mockReturnValue(undefined)
			render(<FormInput {...defaultProps} type='text' />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should clear field value when clear button is clicked', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue('some text')
			render(<FormInput {...defaultProps} type='text' />)

			const clearButton = screen.getByTestId('clear-button')
			await user.click(clearButton)

			expect(mockSetValue).toHaveBeenCalledWith('testField', '')
		})

		it('should show clear button for different input types except password', () => {
			const inputTypes = ['email', 'number', 'tel', 'url', 'search']

			inputTypes.forEach((type) => {
				mockWatch.mockReturnValue('some value')
				const { unmount } = render(<FormInput {...defaultProps} type={type} />)

				expect(screen.getByTestId('clear-button')).toBeInTheDocument()
				unmount()
			})
		})
	})

	describe('error handling', () => {
		it('should display error message when field has error', () => {
			mockFormState.errors = {
				testField: { message: 'This field is required' },
			}

			render(<FormInput {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toBeInTheDocument()
			expect(errorText).toHaveTextContent('This field is required')
		})

		it('should not display error message when field has no error', () => {
			mockFormState.errors = {}
			render(<FormInput {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should apply correct styling to error text', () => {
			mockFormState.errors = {
				testField: { message: 'Error message' },
			}

			render(<FormInput {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveClass('mt-2', 'ml-4')
		})

		it('should handle complex error objects gracefully', () => {
			mockFormState.errors = {
				testField: {
					message: 'Complex error',
					type: 'validation',
					ref: {},
				},
			}

			render(<FormInput {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveTextContent('Complex error')
		})

		it('should handle error without message property', () => {
			mockFormState.errors = {
				testField: { type: 'required' },
			}

			render(<FormInput {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})
	})

	describe('input styling and layout', () => {
		it('should apply correct CSS classes to input', () => {
			render(<FormInput {...defaultProps} />)

			const input = screen.getByTestId('form-input')
			expect(input).toHaveClass('h-11', 'rounded-xl', 'pr-20', 'text-base')
		})

		it('should render input container with relative positioning', () => {
			const { container } = render(<FormInput {...defaultProps} />)

			const relativeDiv = container.querySelector('.relative')
			expect(relativeDiv).toBeInTheDocument()
		})

		it('should render label with correct styling', () => {
			render(<FormInput {...defaultProps} label='Test Label' />)

			const label = screen.getByText('Test Label').closest('p')
			expect(label).toHaveClass('mb-2', 'font-medium')
		})
	})

	describe('accessibility', () => {
		it('should have proper button type for password toggle', () => {
			render(<FormInput {...defaultProps} type='password' />)

			const toggleButton = screen.getByRole('button')
			expect(toggleButton).toHaveAttribute('type', 'button')
		})

		it('should be accessible via keyboard for password toggle', async () => {
			const user = userEvent.setup()
			render(<FormInput {...defaultProps} type='password' />)

			const toggleButton = screen.getByRole('button')

			// Focus the button and press Enter
			toggleButton.focus()
			expect(toggleButton).toHaveFocus()

			await user.keyboard('{Enter}')

			// Verify the password visibility changed
			const input = screen.getByTestId('form-input')
			expect(input).toHaveAttribute('type', 'text')
		})

		it('should maintain proper tab order with multiple interactive elements', () => {
			mockWatch.mockReturnValue('some text')
			render(<FormInput {...defaultProps} type='text' />)

			const input = screen.getByTestId('form-input')
			const clearButton = screen.getByTestId('clear-button')

			// Both elements should be tabbable
			expect(input).not.toHaveAttribute('tabIndex', '-1')
			expect(clearButton).not.toHaveAttribute('tabIndex', '-1')
		})
	})

	describe('edge cases and integration', () => {
		it('should handle rapid password visibility toggles', async () => {
			const user = userEvent.setup()
			render(<FormInput {...defaultProps} type='password' />)

			const toggleButton = screen.getByRole('button')
			const input = screen.getByTestId('form-input')

			// Rapid toggles
			await user.click(toggleButton)
			await user.click(toggleButton)
			await user.click(toggleButton)

			// Should end up visible
			expect(input).toHaveAttribute('type', 'text')
		})

		it('should handle multiple clear button clicks', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue('some text')
			render(<FormInput {...defaultProps} type='text' />)

			const clearButton = screen.getByTestId('clear-button')

			await user.click(clearButton)
			await user.click(clearButton)

			// Should call setValue for each click
			expect(mockSetValue).toHaveBeenCalledTimes(2)
			expect(mockSetValue).toHaveBeenCalledWith('testField', '')
		})

		it('should work with different field names', () => {
			const fieldNames = ['email', 'username', 'firstName', 'password123']

			fieldNames.forEach((fieldName) => {
				mockRegister.mockClear()
				mockWatch.mockClear()

				const { unmount } = render(<FormInput {...defaultProps} name={fieldName} />)

				expect(mockRegister).toHaveBeenCalledWith(fieldName)
				expect(mockWatch).toHaveBeenCalledWith(fieldName)

				unmount()
			})
		})

		it('should handle boolean and numeric values from watch', () => {
			// Test with boolean true (should show clear button)
			mockWatch.mockReturnValue(true)
			const { rerender } = render(<FormInput {...defaultProps} type='text' />)
			expect(screen.getByTestId('clear-button')).toBeInTheDocument()

			// Test with number (should show clear button)
			mockWatch.mockReturnValue(123)
			rerender(<FormInput {...defaultProps} type='text' />)
			expect(screen.getByTestId('clear-button')).toBeInTheDocument()

			// Test with boolean false (should not show clear button)
			mockWatch.mockReturnValue(false)
			rerender(<FormInput {...defaultProps} type='text' />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()

			// Test with zero (should not show clear button)
			mockWatch.mockReturnValue(0)
			rerender(<FormInput {...defaultProps} type='text' />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should maintain state consistency across re-renders', () => {
			const { rerender } = render(<FormInput {...defaultProps} type='password' />)

			// Initial state - password hidden
			const input = screen.getByTestId('form-input')
			expect(input).toHaveAttribute('type', 'password')

			// Toggle visibility
			fireEvent.click(screen.getByRole('button'))
			expect(input).toHaveAttribute('type', 'text')

			// Re-render with same props - state should persist
			rerender(<FormInput {...defaultProps} type='password' />)
			expect(input).toHaveAttribute('type', 'text')
		})
	})

	describe('form integration', () => {
		it('should work with different register configurations', () => {
			const customRegister = vi.fn((name: string) => ({
				name,
				onChange: vi.fn(),
				onBlur: vi.fn(),
				ref: vi.fn(),
			}))

			mockUseFormContext.mockReturnValue({
				...mockUseFormContext(),
				register: customRegister as any,
			})

			render(<FormInput {...defaultProps} name='customField' />)

			expect(customRegister).toHaveBeenCalledWith('customField')
		})

		it('should handle form state updates correctly', () => {
			// Start with no errors
			const { rerender } = render(<FormInput {...defaultProps} />)
			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()

			// Update to have errors
			mockFormState.errors = { testField: { message: 'New error' } }
			rerender(<FormInput {...defaultProps} />)
			expect(screen.getByTestId('error-text')).toHaveTextContent('New error')

			// Clear errors
			mockFormState.errors = {}
			rerender(<FormInput {...defaultProps} />)
			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should handle watch value changes correctly', () => {
			// Start with empty value
			mockWatch.mockReturnValue('')
			const { rerender } = render(<FormInput {...defaultProps} type='text' />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()

			// Update to have value
			mockWatch.mockReturnValue('new value')
			rerender(<FormInput {...defaultProps} type='text' />)
			expect(screen.getByTestId('clear-button')).toBeInTheDocument()

			// Clear value
			mockWatch.mockReturnValue('')
			rerender(<FormInput {...defaultProps} type='text' />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})
	})
})
