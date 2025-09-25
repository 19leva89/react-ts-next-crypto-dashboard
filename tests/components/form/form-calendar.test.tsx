import React from 'react'
import { format } from 'date-fns'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FormCalendar } from '@/components/shared/form/form-calendar'

// Mock date-fns
vi.mock('date-fns', () => ({
	format: vi.fn(),
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
	CalendarIcon: vi.fn(() => <svg data-testid='calendar-icon' className='mr-2 size-4' />),
}))

// Mock the UI components
const TriggerWrapper = ({ children, onOpenChange }: any) => {
	const child = React.Children.only(children) as React.ReactElement<{ onClick?: React.MouseEventHandler }>
	return React.cloneElement(child, {
		onClick: (e: React.MouseEvent) => {
			e.stopPropagation()
			onOpenChange(true)
		},
	})
}

vi.mock('@/components/ui', () => ({
	Button: vi.fn(({ children, className, disabled, ...props }) => (
		<button data-testid='date-button' className={className} disabled={disabled} {...props}>
			{children}
		</button>
	)),
	Calendar: vi.fn(({ onSelect }) => (
		<button data-testid='calendar-select' onClick={() => onSelect?.(new Date('2023-01-01'))}>
			Select Date
		</button>
	)),
	Popover: vi.fn(({ open, onOpenChange, children }) => (
		<div data-testid='popover' data-open={open}>
			<TriggerWrapper onOpenChange={onOpenChange}>{children[0]}</TriggerWrapper>
			{children[1]}
		</div>
	)),
	PopoverContent: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
	PopoverTrigger: vi.fn(({ children, ...props }) => React.cloneElement(React.Children.only(children), props)),
}))

// Mock the shared components
vi.mock('@/components/shared', () => ({
	ClearButton: vi.fn(({ onClick }) => (
		<button data-testid='clear-button' onClick={onClick}>
			Clear
		</button>
	)),
	ErrorText: vi.fn(({ text, className }) => (
		<span data-testid='error-text' className={className}>
			{text}
		</span>
	)),
	RequiredSymbol: vi.fn(() => <span data-testid='required-symbol'> *</span>),
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
	children: React.ReactNode
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

describe('FormCalendar', () => {
	// Sample date for testing
	const testDate = new Date('2023-01-01')
	const formattedDate = 'January 1, 2023'

	const defaultProps = {
		name: 'dateField',
		placeholder: 'Pick a date',
	}

	beforeEach(() => {
		// Clear all mocks before each test
		vi.clearAllMocks()
		// Mock format return value
		vi.mocked(format).mockReturnValue(formattedDate)
	})

	afterEach(() => {
		// Clean up after each test
		vi.restoreAllMocks()
	})

	describe('Rendering', () => {
		it('should render the calendar button with placeholder text', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByTestId('date-button')).toBeInTheDocument()
			expect(screen.getByTestId('date-button')).toHaveTextContent('Pick a date')
			expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
		})

		it('should render label when provided', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} label='Test Date Label' />
				</TestWrapper>,
			)

			expect(screen.getByText('Test Date Label')).toBeInTheDocument()
		})

		it('should display required symbol when required is true', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} label='Test Date Label' required />
				</TestWrapper>,
			)

			expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
		})

		it('should not display required symbol when required is false', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.queryByTestId('required-symbol')).not.toBeInTheDocument()
		})

		it('should display formatted date when form has initial value', () => {
			render(
				<TestWrapper defaultValues={{ dateField: testDate }}>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByTestId('date-button')).toHaveTextContent(formattedDate)
			expect(vi.mocked(format)).toHaveBeenCalledWith(testDate, 'PPP')
		})

		it('should display placeholder when no initial value', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByTestId('date-button')).toHaveTextContent('Pick a date')
		})

		it('should apply custom className to the container', () => {
			const customClass = 'custom-test-class'
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} className={customClass} />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			const popoverDiv = button.closest('[data-testid="popover"]')
			const relativeDiv = popoverDiv?.parentElement
			const container = relativeDiv?.parentElement
			expect(container).toHaveClass(customClass)
		})

		it('should render ClearButton when value is present', () => {
			render(
				<TestWrapper defaultValues={{ dateField: testDate }}>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByTestId('clear-button')).toBeInTheDocument()
		})

		it('should not render ClearButton when no value', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument()
		})
	})

	describe('Popover Behavior', () => {
		it('should open popover when button is clicked', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			await user.click(button)

			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'true')
		})

		it('should close popover after selecting a date', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			await user.click(button)

			const selectButton = screen.getByTestId('calendar-select')
			await user.click(selectButton)

			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'false')
		})

		it('should render calendar in popover', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			await user.click(button)

			expect(screen.getByTestId('calendar-select')).toBeInTheDocument()
		})
	})

	describe('Selection Handling', () => {
		it('should update form value when a date is selected', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm()
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const button = screen.getByTestId('date-button')
			await user.click(button)

			const option = screen.getByTestId('calendar-select')
			await user.click(option)

			await waitFor(() => {
				expect(formValues.dateField).toEqual(new Date('2023-01-01'))
			})
		})

		it('should trigger validation after date selection', async () => {
			const user = userEvent.setup()

			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { dateField: null },
				})

				React.useEffect(() => {
					const validate = async () => {
						methods.register('dateField', { required: 'Date is required' })
						await methods.trigger('dateField')
					}
					validate()
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.getByTestId('error-text')).toBeInTheDocument()
			})

			const button = screen.getByTestId('date-button')
			await user.click(button)

			const option = screen.getByTestId('calendar-select')
			await user.click(option)

			await waitFor(() => {
				expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
			})
		})

		it('should call format with correct arguments when date is selected', async () => {
			render(
				<TestWrapper defaultValues={{ dateField: testDate }}>
					<FormCalendar {...defaultProps} dateFormat='yyyy-MM-dd' />
				</TestWrapper>,
			)

			expect(vi.mocked(format)).toHaveBeenCalledWith(testDate, 'yyyy-MM-dd')
		})
	})

	describe('Clear Functionality', () => {
		it('should clear form value when clear button is clicked', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm({ defaultValues: { dateField: testDate } })
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const clearButton = screen.getByTestId('clear-button')
			await user.click(clearButton)

			await waitFor(() => {
				expect(formValues.dateField).toBeUndefined()
			})
		})

		it('should trigger validation after clearing value', async () => {
			const user = userEvent.setup()
			let errors: any = {}

			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { dateField: testDate },
					mode: 'onChange',
				})
				methods.register('dateField', { required: 'Date is required' })
				errors = methods.formState.errors

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			// Initial no error
			await waitFor(() => {
				expect(errors.dateField).toBeUndefined()
			})

			const clearButton = screen.getByTestId('clear-button')
			await user.click(clearButton)

			await waitFor(() => {
				expect(errors.dateField).toBeDefined()
			})
		})
	})

	describe('Validation', () => {
		it('should display error message when validation fails', async () => {
			const TestComponent = () => {
				const methods = useForm({
					mode: 'onChange',
				})

				React.useEffect(() => {
					const validate = async () => {
						methods.register('dateField', { required: 'Date is required' })
						await methods.trigger('dateField')
					}
					validate()
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.getByTestId('error-text')).toHaveTextContent('Date is required')
			})
		})

		it('should apply error styling to button when validation fails', async () => {
			const TestComponent = () => {
				const methods = useForm({
					mode: 'onChange',
				})

				React.useEffect(() => {
					const validate = async () => {
						methods.register('dateField', { required: 'Date is required' })
						await methods.trigger('dateField')
					}
					validate()
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.getByTestId('date-button')).toHaveClass('border-red-500')
			})
		})

		it('should not display error when valid date is set', async () => {
			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { dateField: testDate },
					mode: 'onChange',
				})

				React.useEffect(() => {
					const validate = async () => {
						methods.register('dateField', { required: 'Date is required' })
						await methods.trigger('dateField')
					}
					validate()
				}, [methods])

				return (
					<FormProvider {...methods}>
						<FormCalendar {...defaultProps} required={false} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			await waitFor(() => {
				expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
			})
		})
	})

	describe('Disabled State', () => {
		it('should render button as disabled when disabled prop is true', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} disabled />
				</TestWrapper>,
			)

			expect(screen.getByTestId('date-button')).toBeDisabled()
		})

		it('should not open popover when button is disabled and clicked', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} disabled />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			await user.click(button)

			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'false')
		})
	})

	describe('Accessibility', () => {
		it('should have proper button role and attributes', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByTestId('date-button')
			expect(button).toHaveAttribute('type', 'button')
		})
	})

	describe('Edge Cases', () => {
		it('should handle undefined label gracefully', () => {
			render(
				<TestWrapper>
					<FormCalendar name='dateField' label={undefined} />
				</TestWrapper>,
			)

			expect(screen.getByTestId('date-button')).toBeInTheDocument()
		})

		it('should handle custom dateFormat', () => {
			const customFormat = 'yyyy-MM-dd'
			render(
				<TestWrapper defaultValues={{ dateField: testDate }}>
					<FormCalendar {...defaultProps} dateFormat={customFormat} />
				</TestWrapper>,
			)

			expect(vi.mocked(format)).toHaveBeenCalledWith(testDate, customFormat)
		})

		it('should not call format when no value', () => {
			render(
				<TestWrapper>
					<FormCalendar {...defaultProps} />
				</TestWrapper>,
			)

			expect(vi.mocked(format)).not.toHaveBeenCalled()
		})
	})
})
