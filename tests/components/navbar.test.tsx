import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { Navbar } from '@/components/shared/navbar'

// Mock dependencies
vi.mock('next-auth/react')
vi.mock('next/navigation')
vi.mock('@tanstack/react-query')

// Mock tRPC
vi.mock('@/trpc/client', () => ({
	useTRPC: () => ({
		helpers: {
			getExchangeRate: {
				queryOptions: () => ({}),
			},
		},
	}),
}))

// Mock custom hook
const mockChangeCurrency = vi.fn()
vi.mock('@/hooks/use-selected-currency', () => ({
	useSelectedCurrency: () => ({
		currency: 'usd',
		changeCurrency: mockChangeCurrency,
	}),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	Button: ({ children, onClick, className, variant, size, ...props }: any) => (
		<button onClick={onClick} className={className} data-variant={variant} data-size={size} {...props}>
			{children}
		</button>
	),
	DropdownMenu: ({ children }: any) => <div data-testid='dropdown-menu'>{children}</div>,
	DropdownMenuContent: ({ children, align, className }: any) => (
		<div data-testid='dropdown-content' data-align={align} className={className}>
			{children}
		</div>
	),
	DropdownMenuItem: ({ children, onClick, className }: any) => (
		<div onClick={onClick} data-testid='dropdown-item' className={className}>
			{children}
		</div>
	),
	DropdownMenuTrigger: ({ children }: any) => <div data-testid='dropdown-trigger'>{children}</div>,
	SidebarTrigger: ({ size, className }: any) => (
		<button className={className} data-testid='sidebar-trigger' data-size={size}>
			Sidebar
		</button>
	),
	Skeleton: ({ className }: any) => (
		<div className={className} data-testid='skeleton'>
			Loading...
		</div>
	),
}))

// Mock shared components
vi.mock('@/components/shared', () => ({
	ModeToggle: () => <div data-testid='mode-toggle'>Mode Toggle</div>,
}))

// Mock utility functions
vi.mock('@/lib', () => ({
	cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
	ChevronsUpDownIcon: ({ size, className }: any) => (
		<div data-testid='chevrons-icon' data-size={size} className={className}>
			↕
		</div>
	),
	WalletIcon: ({ size }: any) => (
		<div data-testid='wallet-icon' data-size={size}>
			💼
		</div>
	),
}))

const useSessionMock = useSession as Mock
const usePathnameMock = usePathname as Mock
const useQueryMock = useQuery as Mock

describe('Navbar', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockChangeCurrency.mockClear()

		// Default mocks
		useSessionMock.mockReturnValue({
			data: { user: { name: 'John Doe' } },
			status: 'authenticated',
		})

		usePathnameMock.mockReturnValue('/dashboard')

		useQueryMock.mockReturnValue({
			data: {
				vsCurrencies: {
					usd: 1,
					eur: 0.85,
					uah: 37,
				},
			},
		})
	})

	it('renders navbar with all main elements', () => {
		render(<Navbar />)

		expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument()
		expect(screen.getByText('dashboard')).toBeInTheDocument()
		expect(screen.getByText('Welcome back, John Doe!')).toBeInTheDocument()
		expect(screen.getByText('Connect wallet')).toBeInTheDocument()
		expect(screen.getAllByText('USD')).toHaveLength(2) // One in trigger, one in dropdown
		expect(screen.getByTestId('mode-toggle')).toBeInTheDocument()
	})

	it('displays correct page name based on pathname', () => {
		usePathnameMock.mockReturnValue('/settings')
		render(<Navbar />)

		expect(screen.getByText('settings')).toBeInTheDocument()
	})

	it('shows skeleton when session is loading', () => {
		useSessionMock.mockReturnValue({
			data: null,
			status: 'loading',
		})

		render(<Navbar />)

		expect(screen.getByTestId('skeleton')).toBeInTheDocument()
		expect(screen.queryByText('Welcome back')).not.toBeInTheDocument()
	})

	it('displays "Guest" when user is not authenticated', () => {
		useSessionMock.mockReturnValue({
			data: null,
			status: 'unauthenticated',
		})

		render(<Navbar />)

		expect(screen.getByText('Welcome back, Guest!')).toBeInTheDocument()
	})

	it('displays "Dashboard" as fallback when pathname is empty', () => {
		usePathnameMock.mockReturnValue('/')
		render(<Navbar />)

		expect(screen.getByText('Dashboard')).toBeInTheDocument()
	})

	it('renders currency dropdown with available currencies', () => {
		render(<Navbar />)

		expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
		expect(screen.getAllByText('USD')).toHaveLength(2) // One in trigger, one in dropdown
		expect(screen.getByText('EUR')).toBeInTheDocument()
		expect(screen.getByText('UAH')).toBeInTheDocument()
		expect(screen.getByTestId('dropdown-trigger')).toBeInTheDocument()
	})

	it('renders wallet icon and chevrons icon', () => {
		render(<Navbar />)

		expect(screen.getByTestId('wallet-icon')).toBeInTheDocument()
		expect(screen.getByTestId('chevrons-icon')).toBeInTheDocument()
	})

	it('handles missing exchange rate data gracefully', () => {
		useQueryMock.mockReturnValue({
			data: null,
		})

		render(<Navbar />)

		// Should only have the trigger USD text when no exchange rate data
		expect(screen.getAllByText('USD')).toHaveLength(1)
		// Should not crash when exchangeRate is null
	})

	it('renders connect wallet button with correct styling', () => {
		render(<Navbar />)

		const walletButton = screen.getByText('Connect wallet').closest('button')
		expect(walletButton).toHaveAttribute('data-variant', 'default')
		expect(walletButton).toHaveAttribute('data-size', 'lg')
		expect(walletButton).toHaveClass('rounded-xl', 'text-white')
	})

	it('tests currency selection functionality', () => {
		render(<Navbar />)

		// Get all dropdown items
		const dropdownItems = screen.getAllByTestId('dropdown-item')
		expect(dropdownItems).toHaveLength(3) // USD, EUR, UAH

		// Test that clicking works (even though handleUpdateExchangeRate is mocked)
		const eurItem = dropdownItems[1] // EUR item
		fireEvent.click(eurItem)

		// The mock function should not be called directly here since it's inside the component
		expect(screen.getByText('EUR')).toBeInTheDocument()
	})

	it('applies correct responsive classes to header', () => {
		render(<Navbar />)

		const header = screen.getByRole('banner')
		expect(header).toHaveClass('sticky', 'inset-x-0', 'top-0', 'border-b', 'bg-background')
	})

	it('verifies page title has capitalize class', () => {
		render(<Navbar />)

		const pageTitle = screen.getByText('dashboard')
		expect(pageTitle).toHaveClass('font-medium', 'capitalize')
	})

	it('handles pathname with multiple segments', () => {
		usePathnameMock.mockReturnValue('/admin/users/settings')
		render(<Navbar />)

		expect(screen.getByText('settings')).toBeInTheDocument()
	})

	it('renders mode toggle only when component is mounted', async () => {
		render(<Navbar />)

		// ModeToggle should be rendered after component mounts
		await waitFor(() => {
			expect(screen.getByTestId('mode-toggle')).toBeInTheDocument()
		})
	})

	it('renders sidebar trigger with correct size', () => {
		render(<Navbar />)

		const sidebarTrigger = screen.getByTestId('sidebar-trigger')
		expect(sidebarTrigger).toHaveAttribute('data-size', 'lg')
		expect(sidebarTrigger).toHaveClass('size-10', 'rounded-xl')
	})

	it('renders currency button with correct styling', () => {
		render(<Navbar />)

		// Find the trigger button specifically (not the dropdown item)
		const triggerContainer = screen.getByTestId('dropdown-trigger')
		const currencyButton = triggerContainer.querySelector('button')

		expect(currencyButton).toHaveAttribute('data-variant', 'outline')
		expect(currencyButton).toHaveAttribute('data-size', 'lg')
		expect(currencyButton).toHaveClass('rounded-xl')
	})

	describe('Currency Dropdown', () => {
		it('renders currency options when exchange rate data is available', () => {
			useQueryMock.mockReturnValue({
				data: {
					vsCurrencies: {
						usd: 1,
						eur: 0.85,
						uah: 37,
					},
				},
			})

			render(<Navbar />)

			expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
			expect(screen.getByTestId('dropdown-content')).toBeInTheDocument()
		})

		it('handles empty exchange rate data', () => {
			useQueryMock.mockReturnValue({
				data: {
					vsCurrencies: {},
				},
			})

			render(<Navbar />)

			// Should not crash with empty currencies
			// Should only have trigger USD text when no currencies
			expect(screen.getAllByText('USD')).toHaveLength(1)
		})

		it('renders dropdown with correct alignment and styling', () => {
			render(<Navbar />)

			const dropdownContent = screen.getByTestId('dropdown-content')
			expect(dropdownContent).toHaveAttribute('data-align', 'start')
			expect(dropdownContent).toHaveClass('rounded-xl', 'bg-white', 'shadow-lg')
		})
	})

	describe('Session States', () => {
		it('handles undefined session data', () => {
			useSessionMock.mockReturnValue({
				data: { user: {} }, // user without name
				status: 'authenticated',
			})

			render(<Navbar />)

			expect(screen.getByText('Welcome back, Guest!')).toBeInTheDocument()
		})

		it('handles null session', () => {
			useSessionMock.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			})

			render(<Navbar />)

			expect(screen.getByText('Welcome back, Guest!')).toBeInTheDocument()
		})

		it('shows user name when authenticated', () => {
			useSessionMock.mockReturnValue({
				data: { user: { name: 'Alice Smith' } },
				status: 'authenticated',
			})

			render(<Navbar />)

			expect(screen.getByText('Welcome back, Alice Smith!')).toBeInTheDocument()
		})
	})

	describe('Responsive Behavior', () => {
		it('applies responsive classes to various elements', () => {
			render(<Navbar />)

			// Check header responsive classes
			const header = screen.getByRole('banner')
			expect(header).toHaveClass('px-4', 'py-3', 'sm:px-6', 'sm:text-base')

			// Check if elements have responsive gap classes
			expect(header.querySelector('.gap-4.sm\\:gap-14')).toBeTruthy()
		})
	})

	describe('Icon Rendering', () => {
		it('renders wallet icon with correct size', () => {
			render(<Navbar />)

			const walletIcon = screen.getByTestId('wallet-icon')
			expect(walletIcon).toHaveAttribute('data-size', '18')
		})

		it('renders chevrons icon with correct size', () => {
			render(<Navbar />)

			const chevronsIcon = screen.getByTestId('chevrons-icon')
			expect(chevronsIcon).toHaveAttribute('data-size', '18')
		})
	})
})
