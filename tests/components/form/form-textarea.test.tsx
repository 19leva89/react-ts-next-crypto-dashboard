import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FormTextarea } from '@/components/shared/form/form-textarea'

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
	useFormContext: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	Textarea: ({ children, ...props }: any) => (
		<textarea data-testid='form-textarea' {...props}>
			{children}
		</textarea>
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

describe('FormTextarea', () => {
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
		name: 'testTextarea',
		label: 'Test Textarea',
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
			register: mockRegister as any,
			formState: mockFormState as any,
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
		it('should render textarea with basic props', () => {
			render(<FormTextarea {...defaultProps} />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toBeInTheDocument()
			expect(textarea.tagName).toBe('TEXTAREA')
		})

		it('should register field with react-hook-form', () => {
			render(<FormTextarea {...defaultProps} />)

			expect(mockRegister).toHaveBeenCalledWith('testTextarea')
		})

		it('should watch field value', () => {
			render(<FormTextarea {...defaultProps} />)

			expect(mockWatch).toHaveBeenCalledWith('testTextarea')
		})

		it('should apply custom className to container', () => {
			const { container } = render(<FormTextarea {...defaultProps} className='custom-class' />)

			expect(container.firstChild).toHaveClass('custom-class')
		})

		it('should pass through additional HTML textarea attributes', () => {
			render(
				<FormTextarea {...defaultProps} disabled maxLength={100} rows={5} placeholder='Enter description' />,
			)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toBeDisabled()
			expect(textarea).toHaveAttribute('maxLength', '100')
			expect(textarea).toHaveAttribute('rows', '5')
			expect(textarea).toHaveAttribute('placeholder', 'Enter description')
		})

		it('should apply correct default styling to textarea', () => {
			render(<FormTextarea {...defaultProps} />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toHaveClass('h-11', 'text-base')
		})
	})

	describe('label rendering', () => {
		it('should render label when provided', () => {
			render(<FormTextarea {...defaultProps} label='Custom Label' />)

			expect(screen.getByText('Custom Label')).toBeInTheDocument()
		})

		it('should render label with correct styling', () => {
			render(<FormTextarea {...defaultProps} label='Test Label' />)

			const label = screen.getByText('Test Label').closest('p')
			expect(label).toHaveClass('mb-2', 'font-medium')
		})

		it('should render required symbol when required is true', () => {
			render(<FormTextarea {...defaultProps} required />)

			expect(screen.getByText('Test Textarea')).toBeInTheDocument()
			expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
		})

		it('should not render required symbol when required is false', () => {
			render(<FormTextarea {...defaultProps} required={false} />)

			expect(screen.getByText('Test Textarea')).toBeInTheDocument()
			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should not render required symbol when required is undefined', () => {
			render(<FormTextarea {...defaultProps} />)

			expect(screen.getByText('Test Textarea')).toBeInTheDocument()
			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should render label even without other props', () => {
			render(<FormTextarea name='minimal' label='Minimal Label' />)

			expect(screen.getByText('Minimal Label')).toBeInTheDocument()
		})
	})

	describe('clear button functionality', () => {
		it('should show clear button when field has value', () => {
			mockWatch.mockReturnValue('some text content')
			render(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
		})

		it('should not show clear button when field is empty', () => {
			mockWatch.mockReturnValue('')
			render(<FormTextarea {...defaultProps} />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should not show clear button for null/undefined values', () => {
			mockWatch.mockReturnValue(null)
			render(<FormTextarea {...defaultProps} />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()

			mockWatch.mockReturnValue(undefined)
			render(<FormTextarea {...defaultProps} />)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should clear field value when clear button is clicked', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue('text to clear')
			render(<FormTextarea {...defaultProps} />)

			const clearButton = screen.getByTestId('clear-button')
			await user.click(clearButton)

			expect(mockSetValue).toHaveBeenCalledWith('testTextarea', '')
		})

		it('should show clear button for different types of truthy values', () => {
			const truthyValues = ['text', ' ', '0', 'false']

			truthyValues.forEach((value) => {
				mockWatch.mockReturnValue(value)
				const { unmount } = render(<FormTextarea {...defaultProps} />)

				expect(screen.getByTestId('clear-button')).toBeInTheDocument()
				unmount()
			})
		})

		it('should not show clear button for falsy values', () => {
			const falsyValues = [false, 0, '', null, undefined]

			falsyValues.forEach((value) => {
				mockWatch.mockReturnValue(value)
				const { unmount } = render(<FormTextarea {...defaultProps} />)

				expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
				unmount()
			})
		})
	})

	describe('error handling', () => {
		it('should display error message when field has error', () => {
			mockFormState.errors = {
				testTextarea: { message: 'This field is required' },
			}

			render(<FormTextarea {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toBeInTheDocument()
			expect(errorText).toHaveTextContent('This field is required')
		})

		it('should not display error message when field has no error', () => {
			mockFormState.errors = {}
			render(<FormTextarea {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should apply correct styling to error text', () => {
			mockFormState.errors = {
				testTextarea: { message: 'Error message' },
			}

			render(<FormTextarea {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveClass('mt-2', 'ml-4')
		})

		it('should handle complex error objects gracefully', () => {
			mockFormState.errors = {
				testTextarea: {
					message: 'Complex validation error',
					type: 'validation',
					ref: {},
				},
			}

			render(<FormTextarea {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveTextContent('Complex validation error')
		})

		it('should handle error without message property', () => {
			mockFormState.errors = {
				testTextarea: { type: 'required' },
			}

			render(<FormTextarea {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should handle multiple errors correctly', () => {
			mockFormState.errors = {
				testTextarea: { message: 'First error' },
				otherField: { message: 'Other error' },
			}

			render(<FormTextarea {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveTextContent('First error')
			expect(errorText).not.toHaveTextContent('Other error')
		})
	})

	describe('styling and layout', () => {
		it('should render container without className when not provided', () => {
			const { container } = render(<FormTextarea name='test' />)
			// Should not include unexpected custom class when none provided
			expect(container.firstChild).not.toHaveClass('custom-class')
		})

		it('should render relative positioned container for textarea', () => {
			const { container } = render(<FormTextarea {...defaultProps} />)

			const relativeDiv = container.querySelector('.relative')
			expect(relativeDiv).toBeInTheDocument()
		})

		it('should maintain textarea styling with custom props', () => {
			render(<FormTextarea {...defaultProps} className='custom-container' />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toHaveClass('h-11', 'text-base')
		})

		it('should handle className merging correctly', () => {
			const { container } = render(<FormTextarea {...defaultProps} className='custom-spacing extra-class' />)

			expect(container.firstChild).toHaveClass('custom-spacing', 'extra-class')
		})
	})

	describe('form integration', () => {
		it('should work with different field names', () => {
			const fieldNames = ['description', 'comments', 'notes', 'message']

			fieldNames.forEach((fieldName) => {
				mockRegister.mockClear()
				mockWatch.mockClear()

				const { unmount } = render(<FormTextarea name={fieldName} />)

				expect(mockRegister).toHaveBeenCalledWith(fieldName)
				expect(mockWatch).toHaveBeenCalledWith(fieldName)

				unmount()
			})
		})

		it('should handle form state updates correctly', () => {
			// Start with no errors
			const { rerender } = render(<FormTextarea {...defaultProps} />)
			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()

			// Update to have errors
			mockFormState.errors = { testTextarea: { message: 'New error' } }
			rerender(<FormTextarea {...defaultProps} />)
			expect(screen.getByTestId('error-text')).toHaveTextContent('New error')

			// Clear errors
			mockFormState.errors = {}
			rerender(<FormTextarea {...defaultProps} />)
			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should handle watch value changes correctly', () => {
			// Start with empty value
			mockWatch.mockReturnValue('')
			const { rerender } = render(<FormTextarea {...defaultProps} />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()

			// Update to have value
			mockWatch.mockReturnValue('new content')
			rerender(<FormTextarea {...defaultProps} />)
			expect(screen.getByTestId('clear-button')).toBeInTheDocument()

			// Clear value
			mockWatch.mockReturnValue('')
			rerender(<FormTextarea {...defaultProps} />)
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})

		it('should work with register return value', () => {
			const customRegisterReturn = {
				name: 'customTextarea',
				onChange: vi.fn(),
				onBlur: vi.fn(),
				ref: vi.fn(),
			}
			mockRegister.mockReturnValue(customRegisterReturn)

			render(<FormTextarea name='customTextarea' />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toBeInTheDocument()
		})
	})

	describe('accessibility and semantics', () => {
		it('should render semantic textarea element', () => {
			render(<FormTextarea {...defaultProps} />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea.tagName).toBe('TEXTAREA')
		})

		it('should support ARIA attributes', () => {
			render(<FormTextarea {...defaultProps} aria-describedby='help-text' aria-label='Description field' />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toHaveAttribute('aria-describedby', 'help-text')
			expect(textarea).toHaveAttribute('aria-label', 'Description field')
		})

		it('should be keyboard accessible', async () => {
			const user = userEvent.setup()
			render(<FormTextarea {...defaultProps} />)

			const textarea = screen.getByTestId('form-textarea')

			// Focus the textarea
			await user.click(textarea)
			expect(textarea).toHaveFocus()

			// Type content
			await user.type(textarea, 'Test content')
			// Note: The actual value change would be handled by react-hook-form
		})

		it('should support all standard textarea attributes', () => {
			render(<FormTextarea {...defaultProps} autoComplete='off' spellCheck={false} wrap='soft' readOnly />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toHaveAttribute('autoComplete', 'off')
			expect(textarea).toHaveAttribute('spellCheck', 'false')
			expect(textarea).toHaveAttribute('wrap', 'soft')
			expect(textarea).toHaveAttribute('readOnly')
		})
	})

	describe('edge cases and error scenarios', () => {
		it('should handle multiple clear button clicks', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue('content to clear')
			render(<FormTextarea {...defaultProps} />)

			const clearButton = screen.getByTestId('clear-button')

			await user.click(clearButton)
			await user.click(clearButton)

			// Should call setValue for each click
			expect(mockSetValue).toHaveBeenCalledTimes(2)
			expect(mockSetValue).toHaveBeenCalledWith('testTextarea', '')
		})

		it('should maintain state consistency across re-renders', () => {
			mockWatch.mockReturnValue('persistent content')
			const { rerender } = render(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()

			// Re-render with same props
			rerender(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
			expect(mockWatch).toHaveBeenCalledWith('testTextarea')
		})

		it('should handle empty/minimal props gracefully', () => {
			render(<FormTextarea name='minimal' />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toBeInTheDocument()
			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should handle very long content correctly', () => {
			const longContent = 'A'.repeat(10000)
			mockWatch.mockReturnValue(longContent)

			render(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
		})

		it('should handle special characters in content', () => {
			const specialContent = '!@#$%^&*()_+-=[]{}|;:,.<>?`~"\'\\/'
			mockWatch.mockReturnValue(specialContent)

			render(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
		})

		it('should work without label', () => {
			render(<FormTextarea name='unlabeled' />)

			const textarea = screen.getByTestId('form-textarea')
			expect(textarea).toBeInTheDocument()
			expect(screen.queryByText(/label/i)).not.toBeInTheDocument()
		})
	})

	describe('component lifecycle', () => {
		it('should clean up properly on unmount', () => {
			const { unmount } = render(<FormTextarea {...defaultProps} />)

			expect(screen.getByTestId('form-textarea')).toBeInTheDocument()

			unmount()

			expect(screen.queryByTestId('form-textarea')).not.toBeInTheDocument()
		})

		it('should handle prop changes correctly', () => {
			const { rerender } = render(<FormTextarea name='field1' label='Label 1' />)

			expect(screen.getByText('Label 1')).toBeInTheDocument()
			expect(mockWatch).toHaveBeenCalledWith('field1')

			// Change props
			mockWatch.mockClear()
			rerender(<FormTextarea name='field2' label='Label 2' />)

			expect(screen.getByText('Label 2')).toBeInTheDocument()
			expect(mockWatch).toHaveBeenCalledWith('field2')
		})

		it('should maintain performance with frequent re-renders', () => {
			const { rerender } = render(<FormTextarea {...defaultProps} />)

			// Multiple re-renders shouldn't cause issues
			for (let i = 0; i < 10; i++) {
				rerender(<FormTextarea {...defaultProps} />)
			}

			expect(screen.getByTestId('form-textarea')).toBeInTheDocument()
			expect(mockRegister).toHaveBeenCalledWith('testTextarea')
		})
	})
})
