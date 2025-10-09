import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { AuthModal } from '@/components/shared/modals/auth-modal/auth-modal'
import { Children, cloneElement, isValidElement, ReactElement, ReactNode, useState } from 'react'

// Mock the UI components and forms to isolate the AuthModal logic
vi.mock('@/components/ui', () => {
	// Define mock components with proper state management for tabs
	const MockDialog = ({ open, onOpenChange, children }: any) =>
		open ? (
			<div data-testid='mock-dialog' data-open={open}>
				{onOpenChange && <button data-testid='close-button' onClick={() => onOpenChange(false)} />}
				{children}
			</div>
		) : null

	const MockDialogContent = ({ children, className, ...props }: any) => (
		<div data-testid='dialog-content' className={className} {...props}>
			{children}
		</div>
	)

	const MockDialogTitle = ({ className }: any) => (
		<h2 data-testid='dialog-title' className={className}>
			Title
		</h2>
	)

	const MockDialogDescription = ({ className }: any) => (
		<p data-testid='dialog-description' className={className}>
			Description
		</p>
	)

	interface MockTabsProps {
		defaultValue: string
		className?: string
		children: ReactNode
		[x: string]: unknown
	}

	interface TabsContentProps {
		value: string
		'data-active'?: string
		[x: string]: unknown
	}

	const MockTabs = ({ defaultValue, className, children }: MockTabsProps) => {
		const [activeValue, setActiveValue] = useState<string>(defaultValue)

		// Type for child elements
		type TabChild = ReactElement<{ value?: string }>

		// Clone children to inject dynamic behavior
		const clonedChildren = Children.map(children, (child) => {
			if (!isValidElement(child)) return child

			const typedChild = child as TabChild

			if (typedChild.type === MockTabsList) {
				// Pass setActiveValue to TabsList for trigger handling
				return cloneElement(typedChild as ReactElement<MockTabsListProps>, { setActiveValue })
			} else if (typedChild.type === MockTabsContent) {
				// Dynamically set data-active based on current active tab
				const isActive = typedChild.props.value === activeValue
				return cloneElement(typedChild as ReactElement<TabsContentProps>, {
					'data-active': isActive.toString(),
				})
			}
			return typedChild
		})

		return (
			<div data-testid='mock-tabs' data-default-value={defaultValue} className={className}>
				{clonedChildren}
			</div>
		)
	}

	interface MockTabsListProps {
		children: ReactNode
		setActiveValue?: (value: string) => void
		[x: string]: unknown
	}

	interface TabsTriggerProps {
		onClick?: (e: MouseEvent) => void
		value: string
		[x: string]: unknown
	}

	const MockTabsList = ({ children, setActiveValue }: MockTabsListProps) => {
		// Clone triggers to add onClick handler for tab switching
		const clonedChildren = Children.map(children, (child) => {
			if (isValidElement<TabsTriggerProps>(child) && child.type === MockTabsTrigger) {
				return cloneElement(child, {
					onClick: (e: MouseEvent) => {
						setActiveValue?.(child.props.value)
						// Call original onClick if any
						child.props.onClick?.(e)
					},
				} as Partial<TabsTriggerProps>)
			}
			return child
		})

		return <div data-testid='tabs-list'>{clonedChildren}</div>
	}

	const MockTabsTrigger = ({ value, children, className, onClick, ...props }: any) => (
		<button
			data-testid={`tab-trigger-${value}`}
			value={value}
			className={className}
			onClick={onClick}
			{...props}
		>
			{children}
		</button>
	)

	const MockTabsContent = ({ value, children, 'data-active': dataActive, ...props }: any) => (
		<div data-testid={`tabs-content-${value}`} data-active={dataActive} {...props}>
			{children}
		</div>
	)

	return {
		Dialog: MockDialog,
		DialogContent: MockDialogContent,
		DialogTitle: MockDialogTitle,
		DialogDescription: MockDialogDescription,
		Tabs: MockTabs,
		TabsList: MockTabsList,
		TabsTrigger: MockTabsTrigger,
		TabsContent: MockTabsContent,
	}
})

// Mock the form components to prevent actual form rendering during tests
vi.mock('@/components/shared/modals/auth-modal/forms', () => ({
	LoginForm: ({ onClose }: any) => (
		<form data-testid='login-form'>
			<button data-testid='login-submit' type='button' onClick={onClose}>
				Login
			</button>
		</form>
	),
	RegisterForm: ({ onClose }: any) => (
		<form data-testid='register-form'>
			<button data-testid='register-submit' type='button' onClick={onClose}>
				Register
			</button>
		</form>
	),
}))

describe('AuthModal', () => {
	// Mock onClose function to track calls
	const mockOnClose = vi.fn()

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders nothing when open is false', () => {
		// Render the component with open=false
		render(<AuthModal open={false} onClose={mockOnClose} />)

		// Expect dialog content to not be visible
		expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()
	})

	it('renders dialog content when open is true', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Expect dialog content to be visible
		expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
	})

	it('calls onClose when dialog is closed', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Simulate closing the dialog
		const closeButton = screen.getByTestId('close-button')
		fireEvent.click(closeButton)

		// Expect onClose to be called once
		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('renders tabs with default login tab active', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Expect tabs list to be rendered
		expect(screen.getByTestId('tabs-list')).toBeInTheDocument()

		// Expect login tab to be active by default (data-active=true on login content)
		expect(screen.getByTestId('tabs-content-login')).toHaveAttribute('data-active', 'true')
		expect(screen.getByTestId('tabs-content-register')).toHaveAttribute('data-active', 'false')
	})

	it('switches to register tab when register trigger is clicked', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Click on register tab trigger
		const registerTrigger = screen.getByTestId('tab-trigger-register')
		fireEvent.click(registerTrigger)

		// Expect register tab content to become active
		expect(screen.getByTestId('tabs-content-register')).toHaveAttribute('data-active', 'true')
		expect(screen.getByTestId('tabs-content-login')).toHaveAttribute('data-active', 'false')
	})

	it('switches back to login tab when login trigger is clicked', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// First switch to register
		fireEvent.click(screen.getByTestId('tab-trigger-register'))

		// Then switch back to login
		const loginTrigger = screen.getByTestId('tab-trigger-login')
		fireEvent.click(loginTrigger)

		// Expect login tab content to be active again
		expect(screen.getByTestId('tabs-content-login')).toHaveAttribute('data-active', 'true')
	})

	it('renders LoginForm in login tab', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Expect login form to be rendered in login tab
		expect(screen.getByTestId('login-form')).toBeInTheDocument()
	})

	it('renders RegisterForm in register tab', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Switch to register tab
		fireEvent.click(screen.getByTestId('tab-trigger-register'))

		// Expect register form to be rendered in register tab
		expect(screen.getByTestId('register-form')).toBeInTheDocument()
	})

	it('passes onClose to forms and calls it on submit', () => {
		// Render the component with open=true
		render(<AuthModal open={true} onClose={mockOnClose} />)

		// Click login submit button
		const loginSubmit = screen.getByTestId('login-submit')
		fireEvent.click(loginSubmit)

		// Expect onClose to be called
		expect(mockOnClose).toHaveBeenCalledTimes(1)

		// Switch to register and test
		fireEvent.click(screen.getByTestId('tab-trigger-register'))
		const registerSubmit = screen.getByTestId('register-submit')
		fireEvent.click(registerSubmit)

		// Expect onClose to be called again
		expect(mockOnClose).toHaveBeenCalledTimes(2)
	})
})
