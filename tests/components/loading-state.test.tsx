import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { LoadingState } from '@/components/shared/loading-state'

// Mock lucide-react
vi.mock('lucide-react', () => ({
	LoaderIcon: ({ className }: { className?: string }) => (
		<div data-testid='loader-icon' className={className} />
	),
}))

describe('LoadingState', () => {
	const defaultProps = {
		title: 'Loading...',
		description: 'Please wait while we process your request',
	}

	describe('Rendering', () => {
		it('should render with title and description', () => {
			render(<LoadingState {...defaultProps} />)

			expect(screen.getByText('Loading...')).toBeInTheDocument()
			expect(screen.getByText('Please wait while we process your request')).toBeInTheDocument()
		})

		it('should render the loader icon', () => {
			render(<LoadingState {...defaultProps} />)

			const loaderIcon = screen.getByTestId('loader-icon')
			expect(loaderIcon).toBeInTheDocument()
		})

		it('should render different title and description when provided', () => {
			const customProps = {
				title: 'Processing Payment',
				description: 'Your payment is being processed securely',
			}

			render(<LoadingState {...customProps} />)

			expect(screen.getByText('Processing Payment')).toBeInTheDocument()
			expect(screen.getByText('Your payment is being processed securely')).toBeInTheDocument()
		})

		it('should handle empty strings for title and description', () => {
			render(<LoadingState title='' description='' />)

			// Should still render the structure even with empty strings
			const loaderIcon = screen.getByTestId('loader-icon')
			expect(loaderIcon).toBeInTheDocument()
		})
	})

	describe('CSS Classes and Structure', () => {
		it('should apply correct container classes', () => {
			const { container } = render(<LoadingState {...defaultProps} />)

			const mainContainer = container.firstChild as HTMLElement
			expect(mainContainer).toHaveClass('flex', 'flex-1', 'items-center', 'justify-center', 'px-8', 'py-4')
		})

		it('should apply correct card classes', () => {
			render(<LoadingState {...defaultProps} />)

			// Find the card container by looking for the element with specific background classes
			const cardContainer = screen.getByText('Loading...').closest('.bg-background')
			expect(cardContainer).toHaveClass(
				'flex',
				'flex-col',
				'items-center',
				'justify-center',
				'gap-y-6',
				'rounded-xl',
				'bg-background',
				'p-10',
				'shadow-sm',
			)
		})

		it('should apply correct loader icon classes', () => {
			render(<LoadingState {...defaultProps} />)

			const loaderIcon = screen.getByTestId('loader-icon')
			expect(loaderIcon).toHaveClass('size-6', 'animate-spin', 'text-primary')
		})

		it('should apply correct text container classes', () => {
			render(<LoadingState {...defaultProps} />)

			const textContainer = screen.getByText('Loading...').closest('.text-center')
			expect(textContainer).toHaveClass('flex', 'flex-col', 'gap-y-2', 'text-center')
		})

		it('should apply correct title classes', () => {
			render(<LoadingState {...defaultProps} />)

			const title = screen.getByText('Loading...')
			expect(title).toHaveClass('text-lg', 'font-medium')
			expect(title.tagName).toBe('H6')
		})

		it('should apply correct description classes', () => {
			render(<LoadingState {...defaultProps} />)

			const description = screen.getByText('Please wait while we process your request')
			expect(description).toHaveClass('text-sm')
			expect(description.tagName).toBe('P')
		})
	})

	describe('HTML Structure', () => {
		it('should have correct HTML structure', () => {
			render(<LoadingState {...defaultProps} />)

			// Check the hierarchy
			const title = screen.getByText('Loading...')
			const description = screen.getByText('Please wait while we process your request')
			const loaderIcon = screen.getByTestId('loader-icon')

			// Title should be h6
			expect(title.tagName).toBe('H6')

			// Description should be p
			expect(description.tagName).toBe('P')

			// They should be in the same text container
			const textContainer = title.parentElement
			expect(textContainer).toBe(description.parentElement)

			// Text container and loader should be in the same card container
			const cardContainer = textContainer?.parentElement
			expect(cardContainer).toBe(loaderIcon.parentElement)
		})

		it('should maintain proper semantic structure', () => {
			render(<LoadingState {...defaultProps} />)

			// Title should be a heading element
			const title = screen.getByRole('heading', { level: 6 })
			expect(title).toHaveTextContent('Loading...')
		})
	})

	describe('Accessibility', () => {
		it('should be accessible with proper heading structure', () => {
			render(<LoadingState {...defaultProps} />)

			const heading = screen.getByRole('heading', { level: 6 })
			expect(heading).toBeInTheDocument()
			expect(heading).toHaveTextContent('Loading...')
		})

		it('should not have any accessibility violations in basic structure', () => {
			const { container } = render(<LoadingState {...defaultProps} />)

			// Basic check for proper nesting - no interactive elements inside each other
			const interactiveElements = container.querySelectorAll('button, a, input, select, textarea')
			expect(interactiveElements).toHaveLength(0) // Should be a static display component
		})
	})

	describe('Content Display', () => {
		it('should handle long titles gracefully', () => {
			const longTitle =
				'This is a very long title that might wrap to multiple lines in the loading state component'
			render(<LoadingState title={longTitle} description={defaultProps.description} />)

			expect(screen.getByText(longTitle)).toBeInTheDocument()
		})

		it('should handle long descriptions gracefully', () => {
			const longDescription =
				'This is a very long description that explains in detail what is happening during the loading process and might span multiple lines to provide comprehensive information to the user'
			render(<LoadingState title={defaultProps.title} description={longDescription} />)

			expect(screen.getByText(longDescription)).toBeInTheDocument()
		})

		it('should handle special characters in title and description', () => {
			const specialTitle = 'Loading... 🔄 (Processing)'
			const specialDescription = "Wait a moment & don't refresh the page!"

			render(<LoadingState title={specialTitle} description={specialDescription} />)

			expect(screen.getByText(specialTitle)).toBeInTheDocument()
			expect(screen.getByText(specialDescription)).toBeInTheDocument()
		})
	})

	describe('Visual Layout', () => {
		it('should center content both horizontally and vertically', () => {
			const { container } = render(<LoadingState {...defaultProps} />)

			const mainContainer = container.firstChild as HTMLElement
			expect(mainContainer).toHaveClass('items-center', 'justify-center')

			const cardContainer = screen.getByText('Loading...').closest('.bg-background')
			expect(cardContainer).toHaveClass('items-center', 'justify-center')
		})

		it('should have proper spacing between elements', () => {
			render(<LoadingState {...defaultProps} />)

			const cardContainer = screen.getByText('Loading...').closest('.bg-background')
			expect(cardContainer).toHaveClass('gap-y-6') // Gap between icon and text

			const textContainer = screen.getByText('Loading...').closest('.text-center')
			expect(textContainer).toHaveClass('gap-y-2') // Gap between title and description
		})
	})
})
