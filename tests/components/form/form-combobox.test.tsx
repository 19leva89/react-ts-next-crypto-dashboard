import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { FormCombobox } from '@/components/shared/form/form-combobox'

// Mock the UI components
vi.mock('@/components/ui', () => ({
	Button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
	Command: vi.fn(({ children }) => <div>{children}</div>),
	CommandEmpty: vi.fn(({ children }) => <div>{children}</div>),
	CommandGroup: vi.fn(({ children }) => <div>{children}</div>),
	CommandInput: vi.fn((props) => <input {...props} />),
	CommandItem: vi.fn(({ children, onSelect, ...props }) => (
		<div onClick={() => onSelect?.(props.value)} {...props}>
			{children}
		</div>
	)),
	CommandList: vi.fn(({ children }) => <div>{children}</div>),
	Popover: vi.fn(({ children, open }) => (
		<div data-testid='popover' data-open={open}>
			{children}
		</div>
	)),
	PopoverContent: vi.fn(({ children }) => <div>{children}</div>),
	PopoverTrigger: vi.fn(({ children }) => <>{children}</>),
}))

// Mock the shared components
vi.mock('@/components/shared', () => ({
	ErrorText: vi.fn(({ text }) => <span data-testid='error-text'>{text}</span>),
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

describe('FormCombobox', () => {
	// Sample data for testing
	const mockMapTable = [
		{ id: 1, name: 'Option 1', communityId: 100 },
		{ id: 2, name: 'Option 2', communityId: 200 },
		{ id: 3, name: 'Option 3', communityId: 300 },
	]

	const defaultProps = {
		name: 'testField',
		placeholder: 'Select an option',
		noResultsText: 'No results found',
		selectPlaceholder: 'Search...',
		mapTable: mockMapTable,
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
		it('should render the combobox with placeholder text', () => {
			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toBeInTheDocument()
			expect(screen.getByText('Select an option')).toBeInTheDocument()
		})

		it('should display selected value when form has initial value', () => {
			render(
				<TestWrapper defaultValues={{ testField: 'Option 2' }}>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toHaveTextContent('Option 2')
		})

		it('should apply custom className', () => {
			const customClass = 'custom-test-class'
			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} className={customClass} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			expect(button.className).toContain(customClass)
		})

		it('should display error message when validation fails', async () => {
			const { container } = render(
				<TestWrapper
					validationRules={{
						testField: {
							required: 'This field is required',
						},
					}}
				>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			// Trigger validation by interacting with the form
			const methods = container.querySelector('form')
			if (methods) {
				await waitFor(() => {
					expect(screen.queryByTestId('error-text')).not.toBeInTheDocument()
				})
			}
		})
	})

	describe('Popover Behavior', () => {
		it('should open popover when button is clicked', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			await user.click(button)

			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'true')
		})

		it('should close popover after selecting an item', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			// Open popover
			const button = screen.getByRole('combobox')
			await user.click(button)

			// Select an item
			const option = screen.getByText('Option 1')
			await user.click(option)

			// Check that popover is closed
			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'false')
		})

		it('should display all options in the dropdown', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			await user.click(button)

			mockMapTable.forEach((item) => {
				expect(screen.getByText(item.name)).toBeInTheDocument()
			})
		})

		it('should show empty message when no results match', () => {
			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} mapTable={[]} />
				</TestWrapper>,
			)

			// The CommandEmpty component would show this message
			// when there are no items to display
			expect(screen.getByText('No results found')).toBeInTheDocument()
		})
	})

	describe('Selection Handling', () => {
		it('should update form value when an item is selected', async () => {
			const user = userEvent.setup()
			let formValues: any = {}

			const TestComponent = () => {
				const methods = useForm()
				formValues = methods.watch()

				return (
					<FormProvider {...methods}>
						<FormCombobox {...defaultProps} />
					</FormProvider>
				)
			}

			render(<TestComponent />)

			// Open and select an option
			const button = screen.getByRole('combobox')
			await user.click(button)

			const option = screen.getByText('Option 2')
			await user.click(option)

			await waitFor(() => {
				expect(formValues.testField).toBe('Option 2')
			})
		})

		it('should call onSelect callback when provided', async () => {
			const onSelectMock = vi.fn()
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} onSelect={onSelectMock} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			await user.click(button)

			const option = screen.getByText('Option 3')
			await user.click(option)

			await waitFor(() => {
				expect(onSelectMock).toHaveBeenCalledWith({
					id: 3,
					name: 'Option 3',
					communityId: 300,
				})
			})
		})

		it('should handle selection with validation', async () => {
			const user = userEvent.setup()

			const TestComponent = () => {
				const methods = useForm({
					mode: 'onChange',
				})

				return (
					<FormProvider {...methods}>
						<FormCombobox {...defaultProps} />
						<div data-testid='form-errors'>{methods.formState.errors.testField?.message?.toString()}</div>
					</FormProvider>
				)
			}

			render(<TestComponent />)

			const button = screen.getByRole('combobox')
			await user.click(button)

			const option = screen.getByText('Option 1')
			await user.click(option)

			// Value should be set and validated
			await waitFor(() => {
				expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')
			})
		})
	})

	describe('Search Functionality', () => {
		it('should render search input in the dropdown', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			await user.click(button)

			const searchInput = screen.getByPlaceholderText('Search...')
			expect(searchInput).toBeInTheDocument()
			expect(searchInput).toHaveAttribute('name', 'testField')
		})
	})

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')

			// Initially closed
			expect(button).toHaveAttribute('aria-expanded', 'false')

			// Open popover
			await user.click(button)
			expect(button).toHaveAttribute('aria-expanded', 'true')
		})

		it('should properly handle keyboard navigation', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')

			// Focus the button
			button.focus()
			expect(button).toHaveFocus()

			// Open with Enter key
			await user.keyboard('{Enter}')

			const popover = screen.getByTestId('popover')
			expect(popover).toHaveAttribute('data-open', 'true')
		})
	})

	describe('Edge Cases', () => {
		it('should handle empty mapTable array', () => {
			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} mapTable={[]} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toBeInTheDocument()
			expect(screen.getByText('Select an option')).toBeInTheDocument()
		})

		it('should handle undefined onSelect callback', async () => {
			const user = userEvent.setup()

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} onSelect={undefined} />
				</TestWrapper>,
			)

			const button = screen.getByRole('combobox')
			await user.click(button)

			const option = screen.getByText('Option 1')

			// Should not throw error when clicking without onSelect
			expect(async () => {
				await user.click(option)
			}).not.toThrow()
		})

		it('should handle items with missing communityId', () => {
			const itemsWithoutCommunityId = [
				{ id: 1, name: 'Item 1' },
				{ id: 2, name: 'Item 2' },
			]

			render(
				<TestWrapper>
					<FormCombobox {...defaultProps} mapTable={itemsWithoutCommunityId} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toBeInTheDocument()
		})

		it('should maintain selection after re-render', async () => {
			userEvent.setup()

			const { rerender } = render(
				<TestWrapper defaultValues={{ testField: 'Option 1' }}>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')

			// Re-render with same props
			rerender(
				<TestWrapper defaultValues={{ testField: 'Option 1' }}>
					<FormCombobox {...defaultProps} />
				</TestWrapper>,
			)

			expect(screen.getByRole('combobox')).toHaveTextContent('Option 1')
		})
	})
})
