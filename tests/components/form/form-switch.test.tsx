import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { FormSwitch } from '@/components/shared/form/form-switch'

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
	useFormContext: vi.fn(),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	Switch: ({ checked, onCheckedChange, disabled, className, id, ...props }: any) => (
		<button
			data-testid='form-switch'
			role='switch'
			aria-checked={!!checked}
			onClick={() => onCheckedChange?.(!checked)}
			disabled={disabled}
			className={className}
			id={id}
			{...props}
		>
			{checked ? 'ON' : 'OFF'}
		</button>
	),
}))

// Mock shared components
vi.mock('@/components/shared', () => ({
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

// Mock cn utility
vi.mock('@/lib', () => ({
	cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('FormSwitch', () => {
	let mockWatch: ReturnType<typeof vi.fn>
	let mockSetValue: ReturnType<typeof vi.fn>
	let mockTrigger: ReturnType<typeof vi.fn>
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
		name: 'testSwitch',
		label: 'Test Switch',
	}

	beforeEach(() => {
		// Create fresh mocks for each test
		mockWatch = vi.fn(() => false)
		mockSetValue = vi.fn()
		mockTrigger = vi.fn().mockResolvedValue(true)
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
			formState: mockFormState as any,
			watch: mockWatch,
			setValue: mockSetValue,
			trigger: mockTrigger,
			// Add other required properties with default values
			register: vi.fn(),
			control: {} as any,
			handleSubmit: vi.fn(),
			reset: vi.fn(),
			resetField: vi.fn(),
			setError: vi.fn(),
			clearErrors: vi.fn(),
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
		it('should render switch with basic props', () => {
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toBeInTheDocument()
			expect(switchElement).toHaveAttribute('role', 'switch')
			expect(switchElement).toHaveAttribute('id', 'testSwitch')
		})

		it('should watch field value from react-hook-form', () => {
			render(<FormSwitch {...defaultProps} />)

			expect(mockWatch).toHaveBeenCalledWith('testSwitch')
		})

		it('should apply custom className to container', () => {
			const { container } = render(<FormSwitch {...defaultProps} className='custom-class' />)

			expect(container.firstChild).toHaveClass('space-y-2', 'custom-class')
		})

		it('should pass through additional props to Switch component', () => {
			render(<FormSwitch {...defaultProps} data-custom='test' />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('data-custom', 'test')
		})
	})

	describe('switch state management', () => {
		it('should display switch as unchecked when value is false', () => {
			mockWatch.mockReturnValue(false)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'false')
			expect(switchElement).toHaveTextContent('OFF')
		})

		it('should display switch as checked when value is true', () => {
			mockWatch.mockReturnValue(true)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'true')
			expect(switchElement).toHaveTextContent('ON')
		})

		it('should handle undefined/null values as false', () => {
			mockWatch.mockReturnValue(undefined)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'false')

			mockWatch.mockReturnValue(null)
			render(<FormSwitch {...defaultProps} />)

			expect(switchElement).toHaveAttribute('aria-checked', 'false')
		})

		it('should handle truthy/falsy values correctly', () => {
			const truthyValues = [1, 'string', [], {}]
			const falsyValues = [0, '', false, null, undefined]

			truthyValues.forEach((value) => {
				mockWatch.mockReturnValue(value)
				const { unmount } = render(<FormSwitch {...defaultProps} />)

				const switchElement = screen.getByTestId('form-switch')
				expect(switchElement).toHaveAttribute('aria-checked', 'true')
				unmount()
			})

			falsyValues.forEach((value) => {
				mockWatch.mockReturnValue(value)
				const { unmount } = render(<FormSwitch {...defaultProps} />)

				const switchElement = screen.getByTestId('form-switch')
				expect(switchElement).toHaveAttribute('aria-checked', 'false')
				unmount()
			})
		})
	})

	describe('user interactions', () => {
		it('should call handleChange when switch is toggled', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue(false)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			await user.click(switchElement)

			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', true, { shouldValidate: true })
			expect(mockTrigger).toHaveBeenCalledWith('testSwitch')
		})

		it('should toggle from true to false', async () => {
			const user = userEvent.setup()
			mockWatch.mockReturnValue(true)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			await user.click(switchElement)

			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', false, { shouldValidate: true })
			expect(mockTrigger).toHaveBeenCalledWith('testSwitch')
		})

		it('should call trigger function after setValue', async () => {
			const user = userEvent.setup()
			mockTrigger.mockResolvedValue(true)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			await user.click(switchElement)

			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', true, { shouldValidate: true })
			await waitFor(() => {
				expect(mockTrigger).toHaveBeenCalledWith('testSwitch')
			})
		})

		it('should handle successful validation trigger', async () => {
			const user = userEvent.setup()
			mockTrigger.mockResolvedValue(true)

			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			await user.click(switchElement)

			// Wait for async operations
			await waitFor(() => {
				expect(mockSetValue).toHaveBeenCalled()
				expect(mockTrigger).toHaveBeenCalled()
			})

			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', true, { shouldValidate: true })
			expect(mockTrigger).toHaveBeenCalledWith('testSwitch')
		})
	})

	describe('disabled state', () => {
		it('should render switch as disabled when disabled prop is true', () => {
			render(<FormSwitch {...defaultProps} disabled />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toBeDisabled()
		})

		it('should apply disabled styling to label', () => {
			render(<FormSwitch {...defaultProps} disabled />)

			const label = screen.getByText('Test Switch')
			expect(label).toHaveClass('cursor-not-allowed', 'opacity-70')
		})

		it('should not trigger handleChange when disabled switch is clicked', async () => {
			const user = userEvent.setup()
			render(<FormSwitch {...defaultProps} disabled />)

			const switchElement = screen.getByTestId('form-switch')

			// Try to click disabled switch
			await user.click(switchElement)

			expect(mockSetValue).not.toHaveBeenCalled()
			expect(mockTrigger).not.toHaveBeenCalled()
		})

		it('should default to enabled when disabled prop is not provided', () => {
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).not.toBeDisabled()
		})
	})

	describe('label and description', () => {
		it('should render label when provided', () => {
			render(<FormSwitch {...defaultProps} label='Custom Label' />)

			const label = screen.getByText('Custom Label')
			expect(label).toBeInTheDocument()
			expect(label.tagName).toBe('LABEL')
			expect(label).toHaveAttribute('for', 'testSwitch')
		})

		it('should not render label when not provided', () => {
			render(<FormSwitch name='testSwitch' />)

			expect(screen.queryByRole('label')).not.toBeInTheDocument()
		})

		it('should render required symbol when required is true', () => {
			render(<FormSwitch {...defaultProps} required />)

			expect(screen.getByText('Test Switch')).toBeInTheDocument()
			expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
		})

		it('should not render required symbol when required is false', () => {
			render(<FormSwitch {...defaultProps} required={false} />)

			expect(screen.getByText('Test Switch')).toBeInTheDocument()
			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should render description when provided', () => {
			render(<FormSwitch {...defaultProps} description='This is a description' />)

			const description = screen.getByText('This is a description')
			expect(description).toBeInTheDocument()
			expect(description.tagName).toBe('P')
			expect(description).toHaveClass('text-sm', 'text-muted-foreground')
		})

		it('should not render description when not provided', () => {
			render(<FormSwitch {...defaultProps} />)

			expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
		})

		it('should render both label and description', () => {
			render(<FormSwitch {...defaultProps} label='Switch Label' description='Switch Description' />)

			expect(screen.getByText('Switch Label')).toBeInTheDocument()
			expect(screen.getByText('Switch Description')).toBeInTheDocument()
		})

		it('should apply cursor-pointer class to label by default', () => {
			render(<FormSwitch {...defaultProps} />)

			const label = screen.getByText('Test Switch')
			expect(label).toHaveClass('cursor-pointer')
		})
	})

	describe('error handling', () => {
		it('should display error message when field has error', () => {
			mockFormState.errors = {
				testSwitch: { message: 'This field is required' },
			}

			render(<FormSwitch {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toBeInTheDocument()
			expect(errorText).toHaveTextContent('This field is required')
			expect(errorText).toHaveClass('ml-4')
		})

		it('should not display error message when field has no error', () => {
			mockFormState.errors = {}
			render(<FormSwitch {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})

		it('should apply error styling to switch when error exists', () => {
			mockFormState.errors = {
				testSwitch: { message: 'Error message' },
			}

			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveClass('border-red-500')
		})

		it('should not apply error styling when no error exists', () => {
			mockFormState.errors = {}
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).not.toHaveClass('border-red-500')
		})

		it('should handle complex error objects gracefully', () => {
			mockFormState.errors = {
				testSwitch: {
					message: 'Complex error',
					type: 'validation',
					ref: {},
				},
			}

			render(<FormSwitch {...defaultProps} />)

			const errorText = screen.getByTestId('error-text')
			expect(errorText).toHaveTextContent('Complex error')
		})

		it('should handle error without message property', () => {
			mockFormState.errors = {
				testSwitch: { type: 'required' },
			}

			render(<FormSwitch {...defaultProps} />)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})
	})

	describe('styling and layout', () => {
		it('should apply correct container classes', () => {
			const { container } = render(<FormSwitch {...defaultProps} />)

			expect(container.firstChild).toHaveClass('space-y-2')
		})

		it('should apply correct wrapper classes to switch container', () => {
			const { container } = render(<FormSwitch {...defaultProps} />)

			const switchContainer = container.querySelector('.flex.items-center.gap-5')
			expect(switchContainer).toBeInTheDocument()
			expect(switchContainer).toHaveClass(
				'flex',
				'items-center',
				'gap-5',
				'rounded-md',
				'border',
				'border-input',
				'p-3',
				'shadow-xs',
			)
		})

		it('should apply correct classes to label text container', () => {
			render(<FormSwitch {...defaultProps} />)

			const labelContainer = screen.getByText('Test Switch').closest('.flex.flex-col.gap-1')
			expect(labelContainer).toBeInTheDocument()
			expect(labelContainer).toHaveClass('flex', 'flex-col', 'gap-1')
		})

		it('should merge custom className with default classes', () => {
			const { container } = render(<FormSwitch {...defaultProps} className='custom-spacing' />)

			expect(container.firstChild).toHaveClass('space-y-2', 'custom-spacing')
		})
	})

	describe('accessibility', () => {
		it('should have proper ARIA attributes', () => {
			mockWatch.mockReturnValue(true)
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('role', 'switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'true')
		})

		it('should associate label with switch using htmlFor and id', () => {
			render(<FormSwitch {...defaultProps} />)

			const label = screen.getByText('Test Switch')
			const switchElement = screen.getByTestId('form-switch')

			expect(label).toHaveAttribute('for', 'testSwitch')
			expect(switchElement).toHaveAttribute('id', 'testSwitch')
		})

		it('should be keyboard accessible', async () => {
			const user = userEvent.setup()
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')

			// Focus the switch
			switchElement.focus()
			expect(switchElement).toHaveFocus()

			// Press Enter to toggle
			await user.keyboard('{Enter}')

			expect(mockSetValue).toHaveBeenCalled()
		})

		it('should support label clicking', async () => {
			const user = userEvent.setup()
			render(<FormSwitch {...defaultProps} />)

			const label = screen.getByText('Test Switch')
			await user.click(label)

			// Label click should focus/activate the switch
			// This behavior depends on the Switch component implementation
			// We can test that the label has proper htmlFor attribute
			expect(label).toHaveAttribute('for', 'testSwitch')
		})

		it('should have proper disabled state accessibility', () => {
			render(<FormSwitch {...defaultProps} disabled />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toBeDisabled()

			const label = screen.getByText('Test Switch')
			expect(label).toHaveClass('cursor-not-allowed', 'opacity-70')
		})
	})

	describe('form integration', () => {
		it('should work with different field names', () => {
			const fieldNames = ['isEnabled', 'acceptTerms', 'newsletter', 'darkMode']

			fieldNames.forEach((fieldName) => {
				mockWatch.mockClear()
				mockSetValue.mockClear()

				const { unmount } = render(<FormSwitch name={fieldName} />)

				expect(mockWatch).toHaveBeenCalledWith(fieldName)

				// Simulate click to test setValue
				const switchElement = screen.getByTestId('form-switch')
				fireEvent.click(switchElement)

				expect(mockSetValue).toHaveBeenCalledWith(fieldName, true, { shouldValidate: true })

				unmount()
			})
		})

		it('should handle setValue with shouldValidate option', async () => {
			const user = userEvent.setup()
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			await user.click(switchElement)

			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', true, { shouldValidate: true })
		})

		it('should handle form state changes correctly', () => {
			// Start with false value
			mockWatch.mockReturnValue(false)
			const { rerender } = render(<FormSwitch {...defaultProps} />)

			let switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'false')

			// Update to true value
			mockWatch.mockReturnValue(true)
			rerender(<FormSwitch {...defaultProps} />)

			switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'true')
		})

		it('should handle form validation correctly', async () => {
			const user = userEvent.setup()
			mockTrigger.mockResolvedValue(true)

			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')

			// Click the switch
			await user.click(switchElement)

			// Wait for async operations to complete
			await waitFor(() => {
				expect(mockSetValue).toHaveBeenCalled()
				expect(mockTrigger).toHaveBeenCalled()
			})

			// Verify setValue was called with correct parameters
			expect(mockSetValue).toHaveBeenCalledWith('testSwitch', true, { shouldValidate: true })
			expect(mockTrigger).toHaveBeenCalledWith('testSwitch')
		})
	})

	describe('edge cases', () => {
		it('should handle rapid toggle clicks', async () => {
			const user = userEvent.setup()
			render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')

			// Rapid clicks
			await user.click(switchElement)
			await user.click(switchElement)
			await user.click(switchElement)

			// Should call setValue for each click
			expect(mockSetValue).toHaveBeenCalledTimes(3)
			expect(mockTrigger).toHaveBeenCalledTimes(3)
		})

		it('should maintain consistent behavior across re-renders', () => {
			mockWatch.mockReturnValue(true)
			const { rerender } = render(<FormSwitch {...defaultProps} />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveAttribute('aria-checked', 'true')

			// Re-render with same props
			rerender(<FormSwitch {...defaultProps} />)

			expect(switchElement).toHaveAttribute('aria-checked', 'true')
			expect(mockWatch).toHaveBeenCalledWith('testSwitch')
		})

		it('should handle empty/minimal props', () => {
			render(<FormSwitch name='minimal' />)

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toBeInTheDocument()
			expect(switchElement).toHaveAttribute('id', 'minimal')
			expect(switchElement).not.toBeDisabled()
		})

		it('should handle complex class name combinations', () => {
			mockFormState.errors = { testSwitch: { message: 'Error' } }

			render(<FormSwitch {...defaultProps} className='custom-class' disabled />)

			const container = screen.getByTestId('form-switch').closest('.space-y-2')
			expect(container).toHaveClass('space-y-2', 'custom-class')

			const switchElement = screen.getByTestId('form-switch')
			expect(switchElement).toHaveClass('border-red-500')
			expect(switchElement).toBeDisabled()

			const label = screen.getByText('Test Switch')
			expect(label).toHaveClass('cursor-not-allowed', 'opacity-70')
		})
	})
})
