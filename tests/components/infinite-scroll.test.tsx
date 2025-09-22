import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { InfiniteScroll } from '@/components/shared/infinite-scroll'

// Mock the custom hook - declare the mock function inside the factory
vi.mock('@/hooks', () => ({
	useIntersectionObserver: vi.fn(),
}))

// Mock UI Button component
vi.mock('@/components/ui', () => ({
	Button: ({ children, onClick, disabled, ...props }: any) => (
		<button onClick={onClick} disabled={disabled} {...props}>
			{children}
		</button>
	),
}))

// Import the mocked hook after mocking
import { useIntersectionObserver } from '@/hooks'
const mockUseIntersectionObserver = vi.mocked(useIntersectionObserver)

describe('InfiniteScroll', () => {
	const defaultProps = {
		hasNextPage: true,
		isFetchingNextPage: false,
		fetchNextPage: vi.fn(),
	}

	const mockTargetRef = { current: null }

	beforeEach(() => {
		// Default mock implementation
		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: false,
		})

		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.resetAllMocks()
	})

	it('renders with basic structure', () => {
		render(<InfiniteScroll {...defaultProps} />)

		expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument()
		expect(screen.getByTestId('infinite-scroll-button')).toBeInTheDocument()
	})

	it('initializes intersection observer with correct options', () => {
		render(<InfiniteScroll {...defaultProps} />)

		expect(mockUseIntersectionObserver).toHaveBeenCalledWith({
			threshold: 0.5,
			rootMargin: '100px',
		})
	})

	it('shows load more button when hasNextPage is true', () => {
		render(<InfiniteScroll {...defaultProps} hasNextPage={true} />)

		const button = screen.getByTestId('infinite-scroll-button')
		expect(button).toBeInTheDocument()
		expect(button).toHaveTextContent('Load more')
		expect(button).not.toBeDisabled()
	})

	it('shows loading state when isFetchingNextPage is true', () => {
		render(<InfiniteScroll {...defaultProps} isFetchingNextPage={true} />)

		const button = screen.getByTestId('infinite-scroll-button')
		expect(button).toHaveTextContent('Loading...')
		expect(button).toBeDisabled()
	})

	it('shows end message when hasNextPage is false', () => {
		render(<InfiniteScroll {...defaultProps} hasNextPage={false} />)

		expect(screen.queryByTestId('infinite-scroll-button')).not.toBeInTheDocument()
		expect(screen.getByTestId('infinite-scroll-end')).toBeInTheDocument()
		expect(screen.getByText('You have reached the end of the list')).toBeInTheDocument()
	})

	it('calls fetchNextPage when button is clicked', async () => {
		const user = userEvent.setup()
		const fetchNextPage = vi.fn()

		render(<InfiniteScroll {...defaultProps} fetchNextPage={fetchNextPage} />)

		const button = screen.getByTestId('infinite-scroll-button')
		await user.click(button)

		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it('automatically calls fetchNextPage when intersecting (non-manual mode)', async () => {
		const fetchNextPage = vi.fn()

		// Mock intersection observer to return intersecting state
		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: true,
		})

		render(<InfiniteScroll {...defaultProps} fetchNextPage={fetchNextPage} />)

		await waitFor(() => {
			expect(fetchNextPage).toHaveBeenCalledTimes(1)
		})
	})

	it('does not auto-fetch when isManual is true', async () => {
		const fetchNextPage = vi.fn()

		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: true,
		})

		render(<InfiniteScroll {...defaultProps} isManual={true} fetchNextPage={fetchNextPage} />)

		// Wait a bit to ensure no automatic call happens
		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(fetchNextPage).not.toHaveBeenCalled()
	})

	it('does not auto-fetch when already fetching', async () => {
		const fetchNextPage = vi.fn()

		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: true,
		})

		render(<InfiniteScroll {...defaultProps} isFetchingNextPage={true} fetchNextPage={fetchNextPage} />)

		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(fetchNextPage).not.toHaveBeenCalled()
	})

	it('does not auto-fetch when no next page available', async () => {
		const fetchNextPage = vi.fn()

		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: true,
		})

		render(<InfiniteScroll {...defaultProps} hasNextPage={false} fetchNextPage={fetchNextPage} />)

		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(fetchNextPage).not.toHaveBeenCalled()
	})

	it('does not auto-fetch when not intersecting', async () => {
		const fetchNextPage = vi.fn()

		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: false,
		})

		render(<InfiniteScroll {...defaultProps} fetchNextPage={fetchNextPage} />)

		await new Promise((resolve) => setTimeout(resolve, 100))

		expect(fetchNextPage).not.toHaveBeenCalled()
	})

	it('applies correct CSS classes to container', () => {
		render(<InfiniteScroll {...defaultProps} />)

		const container = screen.getByTestId('infinite-scroll')
		expect(container).toHaveClass('flex', 'items-center', 'px-4', 'py-2')
	})

	it('applies correct CSS classes to button', () => {
		render(<InfiniteScroll {...defaultProps} />)

		const button = screen.getByTestId('infinite-scroll-button')
		expect(button).toHaveClass('rounded-xl', 'transition-colors', 'duration-300', 'ease-in-out')
		expect(button).toHaveAttribute('variant', 'secondary')
	})

	it('applies correct CSS classes to end message', () => {
		render(<InfiniteScroll {...defaultProps} hasNextPage={false} />)

		const endMessage = screen.getByTestId('infinite-scroll-end')
		expect(endMessage).toHaveClass('text-sm', 'text-muted-foreground')
	})

	it('has invisible trigger element with correct height', () => {
		render(<InfiniteScroll {...defaultProps} />)

		const container = screen.getByTestId('infinite-scroll')
		const triggerElement = container.querySelector('.h-1')

		expect(triggerElement).toBeInTheDocument()
		expect(triggerElement).toHaveClass('h-1')
	})

	it('button is disabled when no next page', () => {
		render(<InfiniteScroll {...defaultProps} hasNextPage={false} />)

		// Should not render button when hasNextPage is false
		expect(screen.queryByTestId('infinite-scroll-button')).not.toBeInTheDocument()
	})

	it('handles rapid intersection changes correctly', async () => {
		const fetchNextPage = vi.fn()

		// Start with not intersecting
		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: false,
		})

		const { rerender } = render(<InfiniteScroll {...defaultProps} fetchNextPage={fetchNextPage} />)

		// Change to intersecting
		mockUseIntersectionObserver.mockReturnValue({
			targetRef: mockTargetRef,
			isIntersecting: true,
		})

		rerender(<InfiniteScroll {...defaultProps} fetchNextPage={fetchNextPage} />)

		await waitFor(() => {
			expect(fetchNextPage).toHaveBeenCalledTimes(1)
		})
	})

	it('renders without console errors', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(<InfiniteScroll {...defaultProps} />)

		expect(consoleSpy).not.toHaveBeenCalled()

		consoleSpy.mockRestore()
	})
})
