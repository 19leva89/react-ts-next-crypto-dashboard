import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { AppLayout } from '@/components/shared/app-layout'

// Mock Next.js cookies function
vi.mock('next/headers', () => ({
	cookies: vi.fn(),
}))

// Mock auth function - returns session or null
vi.mock('@/auth', () => ({
	auth: vi.fn().mockResolvedValue(null),
}))

// Mock tRPC server utilities
vi.mock('@/trpc/server', () => ({
	getQueryClient: vi.fn(),
	trpc: {
		helpers: {
			getExchangeRate: {
				queryOptions: vi.fn().mockReturnValue({
					queryKey: ['exchangeRate'],
					queryFn: vi.fn(),
				}),
			},
		},
	},
}))

// Mock menu constants
vi.mock('@/constants/menu', () => ({
	firstSection: [
		{ id: 1, name: 'Public Item 1', private: false },
		{ id: 2, name: 'Private Item 1', private: true },
	],
	secondSection: [
		{ id: 3, name: 'Public Item 2', private: false },
		{ id: 4, name: 'Private Item 2', private: true },
	],
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	SidebarInset: ({ children, className }: any) => (
		<div data-testid='sidebar-inset' className={className}>
			{children}
		</div>
	),
	SidebarProvider: ({ children, defaultOpen }: any) => (
		<div data-testid='sidebar-provider' data-default-open={defaultOpen}>
			{children}
		</div>
	),
}))

// Mock shared components
vi.mock('@/components/shared', () => ({
	SidebarApp: ({ firstSection, secondSection }: any) => (
		<div data-testid='sidebar-app'>
			<div data-testid='first-section'>{JSON.stringify(firstSection)}</div>
			<div data-testid='second-section'>{JSON.stringify(secondSection)}</div>
		</div>
	),
	Footer: () => <footer data-testid='footer'>Footer</footer>,
	Navbar: () => <nav data-testid='navbar'>Navbar</nav>,
	ScrollToTop: ({ className }: any) => (
		<button data-testid='scroll-to-top' className={className}>
			Scroll to Top
		</button>
	),
}))

// Import mocked functions after mocking
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { getQueryClient, trpc } from '@/trpc/server'

const mockCookies = vi.mocked(cookies)
const mockAuth = vi.mocked(auth)
const mockGetQueryClient = vi.mocked(getQueryClient)
const mockQueryOptions = vi.mocked(trpc.helpers.getExchangeRate.queryOptions)

describe('AppLayout', () => {
	const mockQueryClient = {
		prefetchQuery: vi.fn(),
	}

	const mockCookieStore = {
		get: vi.fn(),
	}

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()

		// Default mock implementations
		mockCookies.mockResolvedValue(mockCookieStore as any)
		// auth already has default mock in vi.mock()
		mockGetQueryClient.mockReturnValue(mockQueryClient as any)
		mockQueryOptions.mockReturnValue({
			queryKey: ['exchangeRate'],
			queryFn: vi.fn(),
		} as any)
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('renders layout structure correctly', async () => {
		// Arrange: Mock sidebar state as closed
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check that all main components are rendered
		expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument()
		expect(screen.getByTestId('sidebar-app')).toBeInTheDocument()
		expect(screen.getByTestId('sidebar-inset')).toBeInTheDocument()
		expect(screen.getByTestId('navbar')).toBeInTheDocument()
		expect(screen.getByTestId('footer')).toBeInTheDocument()
		expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument()
		expect(screen.getByText('Test Content')).toBeInTheDocument()
	})

	it('sets sidebar default state based on cookie value', async () => {
		// Arrange: Mock sidebar state as open
		mockCookieStore.get.mockReturnValue({ value: 'true' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check sidebar provider receives correct default state
		const sidebarProvider = screen.getByTestId('sidebar-provider')
		expect(sidebarProvider).toHaveAttribute('data-default-open', 'true')
	})

	it('defaults sidebar to closed when cookie is not set', async () => {
		// Arrange: Mock no cookie set
		mockCookieStore.get.mockReturnValue(undefined)

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check sidebar provider defaults to closed
		const sidebarProvider = screen.getByTestId('sidebar-provider')
		expect(sidebarProvider).toHaveAttribute('data-default-open', 'false')
	})

	it('filters menu sections correctly when user is not authenticated', async () => {
		// Arrange: Mock no authenticated session
		mockAuth.mockResolvedValue(null as any)
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(<>{LayoutComponent}</>)

		// Assert: Check only public items are passed to sidebar
		const firstSection = screen.getByTestId('first-section')
		const secondSection = screen.getByTestId('second-section')

		expect(firstSection.textContent).toContain('Public Item 1')
		expect(firstSection.textContent).not.toContain('Private Item 1')
		expect(secondSection.textContent).toContain('Public Item 2')
		expect(secondSection.textContent).not.toContain('Private Item 2')
	})

	it('includes private menu items when user is authenticated', async () => {
		// Arrange: Mock authenticated session
		mockAuth.mockResolvedValue({ user: { id: '1', name: 'Test User' } } as any)
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(<>{LayoutComponent}</>)

		// Assert: Check both public and private items are passed to sidebar
		const firstSection = screen.getByTestId('first-section')
		const secondSection = screen.getByTestId('second-section')

		expect(firstSection.textContent).toContain('Public Item 1')
		expect(firstSection.textContent).toContain('Private Item 1')
		expect(secondSection.textContent).toContain('Public Item 2')
		expect(secondSection.textContent).toContain('Private Item 2')
	})

	it('prefetches exchange rate query on server', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'false' })
		const queryOptions = { queryKey: ['exchangeRate'], queryFn: vi.fn() }
		mockQueryOptions.mockReturnValue(queryOptions as any)

		// Act: Render the component
		await AppLayout({ children: <div>Test Content</div> })

		// Assert: Check that query prefetching was called
		expect(mockGetQueryClient).toHaveBeenCalled()
		expect(mockQueryOptions).toHaveBeenCalled()
		expect(mockQueryClient.prefetchQuery).toHaveBeenCalledWith(queryOptions)
	})

	it('applies correct CSS classes to scroll to top button', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check scroll to top button has correct styling
		const scrollButton = screen.getByTestId('scroll-to-top')
		expect(scrollButton).toHaveClass('size-12', 'bg-primary/95', 'font-bold', 'text-white')
	})

	it('applies correct CSS classes to sidebar inset', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check sidebar inset has correct styling
		const sidebarInset = screen.getByTestId('sidebar-inset')
		expect(sidebarInset).toHaveClass('justify-between', 'gap-10', 'overflow-hidden')
	})

	it('wraps children content in container', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		const LayoutComponent = await AppLayout({ children: <div>Test Content</div> })
		render(LayoutComponent as any)

		// Assert: Check children are wrapped in container
		const container = screen.getByText('Test Content').closest('.container')
		expect(container).toBeInTheDocument()
		expect(container).toHaveClass('container')
	})

	it('handles cookie retrieval errors gracefully', async () => {
		// Arrange: Mock cookie store to throw error
		mockCookies.mockRejectedValue(new Error('Cookie error'))

		// Act & Assert: Component should handle error gracefully
		await expect(AppLayout({ children: <div>Test Content</div> })).rejects.toThrow('Cookie error')
	})

	it('handles auth errors gracefully', async () => {
		// Arrange: Mock auth to throw error
		mockAuth.mockRejectedValue(new Error('Auth error'))
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act & Assert: Component should handle error gracefully
		await expect(AppLayout({ children: <div>Test Content</div> })).rejects.toThrow('Auth error')
	})

	it('calls cookies function to access cookie store', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'false' })

		// Act: Render the component
		await AppLayout({ children: <div>Test Content</div> })

		// Assert: Check cookies function was called
		expect(mockCookies).toHaveBeenCalled()
	})

	it('checks for correct sidebar state cookie key', async () => {
		// Arrange: Setup mocks
		mockCookieStore.get.mockReturnValue({ value: 'true' })

		// Act: Render the component
		await AppLayout({ children: <div>Test Content</div> })

		// Assert: Check correct cookie key was accessed
		expect(mockCookieStore.get).toHaveBeenCalledWith('sidebar:state')
	})
})
