/* eslint-disable @next/next/no-img-element */

import userEvent from '@testing-library/user-event'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { cloneElement, createContext, ReactElement, useContext } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from 'vitest'

import { getCoinData } from '@/data/coin'
import { TMarketChartData } from '@/modules/coins/schema'
import { getCoinsMarketChart } from '@/data/market-chart'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal/coin-detail-modal'

// Mock ResizeObserver for recharts ResponsiveContainer
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}))

// Mock process.exit globally to prevent Prisma errors from exiting during imports
const mockExit = vi.spyOn(process, 'exit').mockImplementation(((
	code?: string | number | null | undefined,
) => {
	// No-op: Log for debugging if needed
	console.warn(`process.exit intercepted in test with code: ${code}`)
	return // Explicit return to match 'never'
}) as (code?: string | number | null | undefined) => never)

// Mock dependencies
vi.mock('@/data/coin')
vi.mock('@/data/market-chart')

// Mock Prisma to prevent DB connection (keep for safety)
vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn(() => ({
		$connect: vi.fn().mockResolvedValue(undefined),
		$disconnect: vi.fn().mockResolvedValue(undefined),
	})),
}))

vi.mock('@/hooks/use-format-usd-price', () => ({
	useFormatUSDPrice: () => (value: number | undefined, showFull?: boolean) => {
		if (value === undefined || isNaN(value)) {
			return '$0.00'
		}
		const formatted = showFull ? value.toLocaleString('en-US') : value.toFixed(0)
		return `$${formatted.replace(/\s/g, ' ')}`
	},
}))

// Mock UI components from '@/components/ui'
const SheetContext = createContext<{ onOpenChange: (open: boolean) => void } | null>(null)

vi.mock('@/components/ui', () => ({
	Skeleton: ({ className }: any) => (
		<div className={`animate-pulse ${className || ''}`} data-testid='skeleton' />
	),
	Button: ({ children, onClick }: any) => (
		<button type='button' onClick={onClick}>
			{children}
		</button>
	),
	Sheet: ({ children, onOpenChange }: any) => (
		<SheetContext.Provider value={{ onOpenChange }}>{children}</SheetContext.Provider>
	),
	SheetContent: ({ children }: any) => <div>{children}</div>,
	SheetHeader: ({ children }: any) => <div>{children}</div>,
	SheetTitle: ({ children }: any) => <div>{children}</div>,
	SheetDescription: ({ children }: any) => <div>{children}</div>,
	SheetFooter: ({ children }: any) => <div>{children}</div>,
	SheetClose: ({ asChild, children }: any) => {
		const context = useContext(SheetContext)
		const handleClose = () => context?.onOpenChange(false)
		if (asChild) {
			return cloneElement(children as ReactElement<any>, { onClick: handleClose })
		}
		return (
			<button type='button' onClick={handleClose}>
				{children}
			</button>
		)
	},
	ChartConfig: 'mock',
	ChartContainer: ({ children, ...props }: any) => <div {...props}>{children}</div>,
	ChartTooltip: ({ children }: any) => <div>{children}</div>,
	ChartTooltipContent: ({ children }: any) => <div>{children}</div>,
}))

// Mock Next.js components
vi.mock('next/link', () => ({
	default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

vi.mock('next/image', () => ({
	default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}))

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
	default: {
		sanitize: (input: string) => input,
	},
}))

// Mock recharts components to prevent errors
vi.mock('recharts', () => ({
	CartesianGrid: ({ children }: any) => <div>{children}</div>,
	Line: ({ children }: any) => <div>{children}</div>,
	LineChart: ({ children }: any) => <div>{children}</div>,
	XAxis: () => <div />,
	YAxis: () => <div />,
	ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

describe('CoinDetailModal', () => {
	// Mock data
	const mockCoinData = {
		id: 'bitcoin',
		quantity: 1,
		symbol: 'BTC',
		name: 'Bitcoin',
		description: { en: 'Bitcoin is a decentralized cryptocurrency...' },
		image: { thumb: '/bitcoin.png' },
		market_cap_rank: 1,
		market_data: {
			current_price: { usd: 50000 },
			market_cap: { usd: 1000000000000 },
			high_24h: { usd: 51000 },
			low_24h: { usd: 49000 },
			circulating_supply: 19000000,
			sparkline_7d: { price: [50000, 51000] },
		},
	}

	const mockMarketChartData = {
		prices: [
			[1630000000000, 50000],
			[1630086400000, 51000],
		],
	} as TMarketChartData

	// Setup before each test
	beforeEach(() => {
		vi.mocked(getCoinData).mockResolvedValue(mockCoinData)
		vi.mocked(getCoinsMarketChart).mockResolvedValue(mockMarketChartData)
	})

	// Clean up mocks after each test
	afterEach(() => {
		vi.clearAllMocks()
	})

	// Restore global mocks after all tests
	afterAll(() => {
		mockExit.mockRestore()
	})

	it('renders loading state initially', async () => {
		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={vi.fn()} />)

		// Check for loading skeletons
		await waitFor(
			() => {
				expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
			},
			{ timeout: 1000 },
		)
	})

	it('fetches and displays coin data after loading', async () => {
		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={vi.fn()} />)

		// Wait for data to load (use heading for specificity)
		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
		})

		// Verify coin data display
		expect(screen.getByText(/BTC.*usd/i)).toBeInTheDocument()
		expect(screen.getByText(/50,000/)).toBeInTheDocument()
		expect(screen.getByText('Rank #1')).toBeInTheDocument()
		expect(screen.getByText(/1,000,000,000,000/)).toBeInTheDocument()
		expect(screen.getByText(/19,000,000/)).toBeInTheDocument() // Adjust if supply isn't USD-formatted
		expect(screen.getByText(/51,000/)).toBeInTheDocument()
		expect(screen.getByText(/49,000/)).toBeInTheDocument()
		expect(screen.getByText('Bitcoin is a decentralized cryptocurrency...')).toBeInTheDocument()
	})

	it('changes time range when clicking day options', async () => {
		const user = userEvent.setup()
		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={vi.fn()} />)

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
		})

		// Click the "1 week" button
		const weekButton = screen.getByText('1w')
		await user.click(weekButton)

		// Verify getCoinsMarketChart was called with new days value
		expect(vi.mocked(getCoinsMarketChart)).toHaveBeenCalledWith('bitcoin', 7)
	})

	it('calls closeModal when clicking the close button', async () => {
		const user = userEvent.setup()
		const closeModal = vi.fn()
		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={closeModal} />)

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
		})

		// Click the close button
		const closeButton = screen.getByText('Add to favorites')
		await user.click(closeButton)

		// Verify closeModal was called
		expect(closeModal).toHaveBeenCalledWith(false)
	})

	it('handles error state when data fetching fails', async () => {
		// Mock failed API calls
		vi.mocked(getCoinData).mockRejectedValue(new Error('API Error'))
		vi.mocked(getCoinsMarketChart).mockRejectedValue(new Error('API Error'))

		// Mock console.error to avoid real logging
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={vi.fn()} />)

		// Wait for loading to complete (no skeletons)
		await waitFor(() => {
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0)
		})

		// Verify console.error was called
		expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching coin details:', expect.any(Error))
		consoleErrorSpy.mockRestore()
	})

	it('displays fallback image when coin image fails to load', async () => {
		vi.mocked(getCoinData).mockResolvedValue({
			...mockCoinData,
			image: { thumb: '/invalid-image.png' },
		})

		render(<CoinDetailModal coinId='bitcoin' showDetailModal={true} closeModal={vi.fn()} />)

		// Wait for data to load
		await waitFor(() => {
			expect(screen.getByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
		})

		// Verify fallback image (simulate load error)
		const image = screen.getByAltText('Bitcoin')
		fireEvent.error(image)
		expect(image).toHaveAttribute('src', '/svg/coin-not-found.svg')
	})
})
