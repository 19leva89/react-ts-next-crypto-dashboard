import { ReactNode, useEffect } from 'react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FormCheckbox } from '@/components/shared/form/form-checkbox'

// Mock the UI components
vi.mock('@/components/ui', () => ({
	Checkbox: vi.fn(({ className, disabled, checked, onCheckedChange, id, ...props }) => (
		<input
			type='checkbox'
			data-testid='checkbox'
			className={className}
			disabled={disabled}
			checked={checked}
			id={id}
			onChange={(e) => onCheckedChange?.(e.target.checked)}
			{...props}
		/>
	)),
	Label: vi.fn(({ htmlFor, children, className, ...props }) => (
		<label htmlFor={htmlFor} className={className} {...props}>
			{children}
		</label>
	)),
}))

// Mock the shared components
vi.mock('@/components/shared', () => ({
	ErrorText: vi.fn(({ text, className }) => (
		<span data-testid='error-text' className={className}>
			{text}
		</span>
	)),
	RequiredSymbol: vi.fn(() => <span data-testid='required-symbol'>*</span>),
}))

// Mock the utility function
vi.mock('@/lib', () => ({
	cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}))

// Test wrapper component that provides form context
const TestWrapper = ({
	children,
	defaultValues = {},
	validationRules = {},
}: {
	children: ReactNode
	defaultValues?: Record<string, any>
	validationRules?: Record<string, any>
}) => {
	const methods = useForm({
		defaultValues,
		mode: 'onChange',
	})

	// Apply validation rules if provided
	if (validationRules) {
		Object.keys(validationRules).forEach((key) => {
			methods.register(key, validationRules[key])
		})
	}

	return <FormProvider {...methods}>{children}</FormProvider>
}

describe('FormCheckbox', () => {
	const defaultProps = {
		name: 'testField',
		label: 'Test Checkbox Label',
	}

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks()
	})

	afterEach(() => {
		// Clean up after each test
		vi.restoreAllMocks()
	})

	describe('Rendering', () => {
		it('should render the checkbox with label', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('checkbox')).toBeInTheDocument()
			expect(screen.getByLabelText('Test Checkbox Label')).toBeInTheDocument()
		})

		it('should display required symbol when required is true', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} required />
				</TestWrapper>,
			)

			expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
		})

		it('should not display required symbol when required is false', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should display checked state when form has initial true value', () => {
			render(
				<TestWrapper defaultValues={{ testField: true }}>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('checkbox')).toBeChecked()
		})

		it('should display unchecked state when form has initial false value', () => {
			render(
				<TestWrapper defaultValues={{ testField: false }}>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('checkbox')).not.toBeChecked()
		})

		it('should apply custom className to the container', () => {
			const customClass = 'custom-test-class'
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} className={customClass} />
				</TestWrapper>,
			)

			const checkbox = screen.getByTestId('checkbox')
			const container = checkbox.parentElement!.parentElement!
			expect(container).toHaveClass(customClass)
		})
	})

	describe('Validation', () => {
		it('should display error message when required and value is false', async () => {
			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { testField: false },
					mode: 'onChange',
				})

				useEffect(() => {
					methods.register('testField', { required: 'This is required.' })
					methods.trigger('testField')
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.getByTestId('error-text')).toHaveTextContent('This is required.')
			})
		})

		it('should apply error styling to checkbox when validation fails', async () => {
			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { testField: false },
					mode: 'onChange',
				})

				useEffect(() => {
					methods.register('testField', { required: 'This is required.' })
					methods.trigger('testField')
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.getByTestId('checkbox')).toHaveClass('border-red-500 text-red-600 focus:ring-red-500')
			})
		})

		it('should not display error when required and value is true', async () => {
			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { testField: true },
					mode: 'onChange',
				})

				useEffect(() => {
					methods.register('testField', { required: 'This is required.' })
					methods.trigger('testField')
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
			})
		})
	})

	describe('Interaction', () => {
		it('should update form value when checkbox is toggled', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm({ defaultValues: { testField: false } })
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const checkbox = screen.getByRole('checkbox')
			await user.click(checkbox)

			await waitFor(() => {
				expect(formValues.testField).toBe(true)
			})
		})

		it('should toggle back to false when clicked again', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm({ defaultValues: { testField: true } })
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const checkbox = screen.getByRole('checkbox')
			await user.click(checkbox)

			await waitFor(() => {
				expect(formValues.testField).toBe(false)
			})
		})
	})

	describe('Disabled State', () => {
		it('should render checkbox as disabled when disabled prop is true', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} disabled />
				</TestWrapper>,
			)

			expect(screen.getByRole('checkbox')).toBeDisabled()
		})

		it('should not update form value when disabled and clicked', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm({ defaultValues: { testField: false } })
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCheckbox {...defaultProps} disabled />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const checkbox = screen.getByRole('checkbox')
			await user.click(checkbox)

			await waitFor(() => {
				expect(formValues.testField).toBe(false)
			})
		})
	})

	describe('Accessibility', () => {
		it('should associate label with checkbox via htmlFor and id', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			const checkbox = screen.getByRole('checkbox')
			const label = screen.getByText('Test Checkbox Label')

			expect(checkbox).toHaveAttribute('id', 'testField')
			expect(label).toHaveAttribute('for', 'testField')
		})
	})

	describe('Edge Cases', () => {
		it('should handle undefined label gracefully', () => {
			render(
				<TestWrapper>
					<FormCheckbox name='testField' label='' />
				</TestWrapper>,
			)

			expect(screen.getByRole('checkbox')).toBeInTheDocument()
		})

		it('should handle no validation rules', () => {
			render(
				<TestWrapper>
					<FormCheckbox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
		})
	})
})
