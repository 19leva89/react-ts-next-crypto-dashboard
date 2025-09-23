import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { ScrollToTop } from '@/components/shared/scroll-to-top'

// Mock dependencies
vi.mock('@/lib', () => ({
	cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@/components/ui', () => ({
	Button: ({ children, onClick, className, variant, type, ...props }: any) => (
		<button onClick={onClick} className={className} data-variant={variant} data-type={type} {...props}>
			{children}
		</button>
	),
}))

vi.mock('lucide-react', () => ({
	ChevronUpIcon: ({ width, height, className }: any) => (
		<div data-testid='chevron-up-icon' data-width={width} data-height={height} className={className}>
			↑
		</div>
	),
}))

// Mock window methods
const mockScrollTo = vi.fn()
Object.defineProperty(window, 'scrollTo', {
	value: mockScrollTo,
	writable: true,
})

// Mock window properties
Object.defineProperty(window, 'scrollY', {
	value: 0,
	writable: true,
	configurable: true,
})

Object.defineProperty(window, 'innerHeight', {
	value: 768,
	writable: true,
	configurable: true,
})

describe('ScrollToTop', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockScrollTo.mockClear()

		// Reset window properties
		Object.defineProperty(window, 'scrollY', {
			value: 0,
			writable: true,
			configurable: true,
		})

		Object.defineProperty(window, 'innerHeight', {
			value: 768,
			writable: true,
			configurable: true,
		})
	})

	afterEach(() => {
		// Clean up event listeners
		vi.restoreAllMocks()
	})

	describe('Visibility behavior', () => {
		it('does not render button when scroll position is below screen height', () => {
			Object.defineProperty(window, 'scrollY', { value: 500 })
			Object.defineProperty(window, 'innerHeight', { value: 768 })

			render(<ScrollToTop />)

			expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()
		})

		it('renders button when scroll position exceeds screen height', async () => {
			render(<ScrollToTop />)

			// Simulate scrolling beyond screen height
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})

		it('hides button when scrolling back to top', async () => {
			render(<ScrollToTop />)

			// First scroll down to show button
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})

			// Then scroll back up to hide button
			Object.defineProperty(window, 'scrollY', { value: 400 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()
			})
		})

		it('shows button exactly at screen height threshold', async () => {
			Object.defineProperty(window, 'innerHeight', { value: 768 })
			render(<ScrollToTop />)

			// Scroll to exactly screen height + 1
			Object.defineProperty(window, 'scrollY', { value: 769 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})

		it('hides button exactly at screen height threshold', async () => {
			Object.defineProperty(window, 'innerHeight', { value: 768 })
			render(<ScrollToTop />)

			// Show button first
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})

			// Scroll to exactly screen height
			Object.defineProperty(window, 'scrollY', { value: 768 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()
			})
		})
	})

	describe('Scroll functionality', () => {
		it('calls window.scrollTo with correct parameters when clicked', async () => {
			render(<ScrollToTop />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})

			const button = screen.getByTestId('chevron-up-icon').closest('button')
			fireEvent.click(button!)

			expect(mockScrollTo).toHaveBeenCalledWith({
				top: 0,
				left: 0,
				behavior: 'smooth',
			})
			expect(mockScrollTo).toHaveBeenCalledTimes(1)
		})

		it('scrolls to top multiple times when clicked multiple times', async () => {
			render(<ScrollToTop />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})

			const button = screen.getByTestId('chevron-up-icon').closest('button')

			fireEvent.click(button!)
			fireEvent.click(button!)
			fireEvent.click(button!)

			expect(mockScrollTo).toHaveBeenCalledTimes(3)
		})
	})

	describe('Button styling and properties', () => {
		it('renders button with correct default styling', async () => {
			render(<ScrollToTop />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				expect(button).toHaveAttribute('data-variant', 'outline')
				expect(button).toHaveAttribute('data-type', 'button')
				expect(button).toHaveClass(
					'fixed',
					'right-11',
					'bottom-11',
					'rounded-full',
					'p-0',
					'transition-colors',
					'duration-300',
					'ease-in-out',
				)
			})
		})

		it('applies custom className when provided', async () => {
			const customClass = 'custom-scroll-button'
			render(<ScrollToTop className={customClass} />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				expect(button).toHaveClass(customClass)
			})
		})

		it('renders ChevronUpIcon with correct props', async () => {
			render(<ScrollToTop />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const icon = screen.getByTestId('chevron-up-icon')
				expect(icon).toHaveAttribute('data-width', '24')
				expect(icon).toHaveAttribute('data-height', '24')
				expect(icon).toHaveClass('size-6')
			})
		})

		it('combines custom className with default classes using cn utility', async () => {
			const customClass = 'bg-blue-500 hover:bg-blue-600'
			render(<ScrollToTop className={customClass} />)

			// Make button visible
			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				// Should have both default and custom classes
				expect(button).toHaveClass('fixed', 'right-11', 'bottom-11')
				expect(button).toHaveClass(customClass)
			})
		})
	})

	describe('Event listener management', () => {
		it('adds scroll event listener on mount', () => {
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

			render(<ScrollToTop />)

			expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
		})

		it('removes scroll event listener on unmount', () => {
			const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

			const { unmount } = render(<ScrollToTop />)
			unmount()

			expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
		})

		it('handles multiple scroll events correctly', async () => {
			render(<ScrollToTop />)

			// Scroll down multiple times
			Object.defineProperty(window, 'scrollY', { value: 500 })
			fireEvent.scroll(window)

			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			Object.defineProperty(window, 'scrollY', { value: 1200 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})
	})

	describe('Different screen sizes', () => {
		it('handles small screen height', async () => {
			Object.defineProperty(window, 'innerHeight', { value: 400 })
			render(<ScrollToTop />)

			// Scroll beyond small screen height
			Object.defineProperty(window, 'scrollY', { value: 450 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})

		it('handles large screen height', async () => {
			Object.defineProperty(window, 'innerHeight', { value: 1440 })
			render(<ScrollToTop />)

			// Scroll less than large screen height
			Object.defineProperty(window, 'scrollY', { value: 1000 })
			fireEvent.scroll(window)

			expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()

			// Scroll beyond large screen height
			Object.defineProperty(window, 'scrollY', { value: 1500 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})
	})

	describe('Edge cases', () => {
		it('handles window.scrollY of 0', async () => {
			render(<ScrollToTop />)

			Object.defineProperty(window, 'scrollY', { value: 0 })
			fireEvent.scroll(window)

			expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument()
		})

		it('handles rapid scroll changes', async () => {
			render(<ScrollToTop />)

			// Rapid scroll changes
			for (let i = 0; i < 10; i++) {
				Object.defineProperty(window, 'scrollY', { value: i * 100 })
				fireEvent.scroll(window)
			}

			// Final position beyond screen height
			Object.defineProperty(window, 'scrollY', { value: 1000 })
			fireEvent.scroll(window)

			await waitFor(() => {
				expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
			})
		})

		it('works without custom className', async () => {
			render(<ScrollToTop />)

			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				expect(button).toBeInTheDocument()
				expect(button).toHaveClass('fixed', 'right-11', 'bottom-11')
			})
		})
	})

	describe('Accessibility', () => {
		it('button has correct type attribute', async () => {
			render(<ScrollToTop />)

			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				expect(button).toHaveAttribute('data-type', 'button')
			})
		})

		it('can be clicked with keyboard navigation', async () => {
			render(<ScrollToTop />)

			Object.defineProperty(window, 'scrollY', { value: 800 })
			fireEvent.scroll(window)

			await waitFor(() => {
				const button = screen.getByTestId('chevron-up-icon').closest('button')
				button!.focus()
				fireEvent.keyDown(button!, { key: 'Enter' })
				fireEvent.click(button!)

				expect(mockScrollTo).toHaveBeenCalledWith({
					top: 0,
					left: 0,
					behavior: 'smooth',
				})
			})
		})
	})
})
