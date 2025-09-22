import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ErrorState } from '@/components/shared/error-state'

// Mock lucide-react
vi.mock('lucide-react', () => ({
	AlertCircleIcon: ({ className }: { className?: string }) => (
		<svg data-testid='alert-circle-icon' className={className}>
			<title>Alert Circle Icon</title>
		</svg>
	),
}))

describe('ErrorState', () => {
	const defaultProps = {
		title: 'Something went wrong',
		description: 'Please try again later or contact support if the problem persists.',
	}

	it('renders with title and description', () => {
		render(<ErrorState {...defaultProps} />)

		expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
		expect(screen.getByText(defaultProps.description)).toBeInTheDocument()
	})

	it('displays the alert circle icon', () => {
		render(<ErrorState {...defaultProps} />)

		const icon = screen.getByTestId('alert-circle-icon')
		expect(icon).toBeInTheDocument()
		expect(icon).toHaveClass('size-6', 'text-red-500')
	})

	it('applies correct layout styles', () => {
		render(<ErrorState {...defaultProps} />)

		// Check outer container styles
		const outerContainer = screen.getByText(defaultProps.title).closest('div')?.parentElement?.parentElement
		expect(outerContainer).toHaveClass('flex', 'flex-1', 'items-center', 'justify-center', 'px-8', 'py-4')
	})

	it('applies correct inner container styles', () => {
		render(<ErrorState {...defaultProps} />)

		// Check inner container with shadow and background
		const innerContainer = screen.getByText(defaultProps.title).closest('div')?.parentElement
		expect(innerContainer).toHaveClass(
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

	it('renders title with correct heading styles', () => {
		render(<ErrorState {...defaultProps} />)

		const title = screen.getByRole('heading', { level: 6 })
		expect(title).toHaveTextContent(defaultProps.title)
		expect(title).toHaveClass('text-lg', 'font-medium')
	})

	it('renders description with correct paragraph styles', () => {
		render(<ErrorState {...defaultProps} />)

		const description = screen.getByText(defaultProps.description)
		expect(description.tagName).toBe('P')
		expect(description).toHaveClass('text-sm')
	})

	it('centers text content', () => {
		render(<ErrorState {...defaultProps} />)

		// Check text container has centered layout
		const textContainer = screen.getByText(defaultProps.title).parentElement
		expect(textContainer).toHaveClass('flex', 'flex-col', 'gap-y-2', 'text-center')
	})

	it('handles long title and description', () => {
		const longProps = {
			title: 'This is a very long error title that might wrap to multiple lines',
			description:
				'This is a very long error description that provides detailed information about what went wrong and what the user should do to resolve the issue. It might contain multiple sentences and should be displayed properly.',
		}

		render(<ErrorState {...longProps} />)

		expect(screen.getByText(longProps.title)).toBeInTheDocument()
		expect(screen.getByText(longProps.description)).toBeInTheDocument()
	})

	it('handles special characters in title and description', () => {
		const specialProps = {
			title: 'Error: Network & Connection Failed!',
			description: 'Unable to connect to server. Check your network settings & try again.',
		}

		render(<ErrorState {...specialProps} />)

		expect(screen.getByText(specialProps.title)).toBeInTheDocument()
		expect(screen.getByText(specialProps.description)).toBeInTheDocument()
	})

	it('has proper semantic structure for accessibility', () => {
		render(<ErrorState {...defaultProps} />)

		// Should have a heading for the title
		const heading = screen.getByRole('heading', { level: 6 })
		expect(heading).toBeInTheDocument()

		// Icon should have accessible title
		const iconTitle = screen.getByTitle('Alert Circle Icon')
		expect(iconTitle).toBeInTheDocument()
	})

	it('renders without any console errors', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(<ErrorState {...defaultProps} />)

		expect(consoleSpy).not.toHaveBeenCalled()

		consoleSpy.mockRestore()
	})
})
