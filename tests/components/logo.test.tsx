/* eslint-disable @next/next/no-img-element */

import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { Logo } from '@/components/shared/logo'

// Mock useSidebar hook
const mockUseSidebar = vi.fn()

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({
		src,
		alt,
		width,
		height,
		priority,
	}: {
		src: string
		alt: string
		width: number
		height: number
		priority?: boolean
	}) => (
		<img
			src={src}
			alt={alt}
			width={width}
			height={height}
			data-testid='next-image'
			data-priority={priority}
		/>
	),
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	useSidebar: () => mockUseSidebar(),
}))

describe('Logo', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('When sidebar is open', () => {
		beforeEach(() => {
			mockUseSidebar.mockReturnValue({ open: true })
		})

		it('should render expanded logo with text', () => {
			const { container } = render(<Logo />)

			// Check that the expanded container is rendered
			const expandedContainer = container.querySelector('.bg-blue-50')
			expect(expandedContainer).toBeInTheDocument()
			expect(expandedContainer).toHaveClass(
				'flex',
				'h-12',
				'w-56',
				'gap-3',
				'rounded-xl',
				'bg-blue-50',
				'p-2',
				'transition-all',
				'duration-200',
			)

			// Check image container
			expect(expandedContainer).not.toBeNull()

			if (expandedContainer) {
				const imageContainer = expandedContainer.querySelector('.bg-blue-200')
				expect(imageContainer).toBeInTheDocument()
				expect(imageContainer).toHaveClass(
					'flex',
					'items-center',
					'justify-center',
					'rounded-xl',
					'bg-blue-200',
					'p-2',
				)
			}

			// Check image
			const image = screen.getByTestId('next-image')
			expect(image).toHaveAttribute('src', '/svg/logo-icon.svg')
			expect(image).toHaveAttribute('alt', 'Crypto logo')
			expect(image).toHaveAttribute('width', '20')
			expect(image).toHaveAttribute('height', '20')
			expect(image).toHaveAttribute('data-priority', 'true')

			// Check text content
			expect(screen.getByText('Crypto')).toBeInTheDocument()
			expect(screen.getByText('Finance app')).toBeInTheDocument()

			// Check text styling
			const cryptoText = screen.getByText('Crypto')
			expect(cryptoText).toHaveClass('text-xs', 'font-semibold')

			const financeText = screen.getByText('Finance app')
			expect(financeText).toHaveClass('text-[10px]', 'font-medium')

			// Check text container
			const textContainer = cryptoText.parentElement
			expect(textContainer).toHaveClass(
				'flex',
				'flex-col',
				'gap-0',
				'text-blue-600',
				'transition-all',
				'duration-100',
			)
		})

		it('should have only one image when expanded', () => {
			render(<Logo />)

			const images = screen.getAllByTestId('next-image')
			expect(images).toHaveLength(1)
		})
	})

	describe('When sidebar is closed', () => {
		beforeEach(() => {
			mockUseSidebar.mockReturnValue({ open: false })
		})

		it('should render collapsed logo without text', () => {
			const { container } = render(<Logo />)

			// Check that the collapsed container is rendered
			const collapsedContainer = container.querySelector('.bg-blue-200')
			expect(collapsedContainer).toBeInTheDocument()
			expect(collapsedContainer).toHaveClass(
				'flex',
				'size-8',
				'items-center',
				'justify-center',
				'rounded-xl',
				'bg-blue-200',
				'transition-all',
				'duration-200',
			)

			// Check image
			const image = screen.getByTestId('next-image')
			expect(image).toHaveAttribute('src', '/svg/logo-icon.svg')
			expect(image).toHaveAttribute('alt', 'Crypto logo')
			expect(image).toHaveAttribute('width', '20')
			expect(image).toHaveAttribute('height', '20')
			expect(image).toHaveAttribute('data-priority', 'true')

			// Check that text is not rendered
			expect(screen.queryByText('Crypto')).not.toBeInTheDocument()
			expect(screen.queryByText('Finance app')).not.toBeInTheDocument()
		})

		it('should have only one image when collapsed', () => {
			render(<Logo />)

			const images = screen.getAllByTestId('next-image')
			expect(images).toHaveLength(1)
		})
	})

	describe('Custom className', () => {
		it('should apply custom className to root element when sidebar is open', () => {
			mockUseSidebar.mockReturnValue({ open: true })

			const { container } = render(<Logo className='custom-class another-class' />)

			const rootElement = container.firstChild as HTMLElement
			expect(rootElement).toHaveClass('custom-class', 'another-class')
		})

		it('should apply custom className to root element when sidebar is closed', () => {
			mockUseSidebar.mockReturnValue({ open: false })

			const { container } = render(<Logo className='custom-class another-class' />)

			const rootElement = container.firstChild as HTMLElement
			expect(rootElement).toHaveClass('custom-class', 'another-class')
		})
	})

	describe('Image properties', () => {
		it.each([
			{ open: true, scenario: 'expanded' },
			{ open: false, scenario: 'collapsed' },
		])('should have correct image properties when $scenario', ({ open }) => {
			mockUseSidebar.mockReturnValue({ open })

			render(<Logo />)

			const image = screen.getByRole('img')
			expect(image).toHaveAttribute('alt', 'Crypto logo')
			expect(image).toHaveAttribute('src', '/svg/logo-icon.svg')
			expect(image).toHaveAttribute('width', '20')
			expect(image).toHaveAttribute('height', '20')
		})

		it.each([{ open: true }, { open: false }])('should have priority loading for both states', ({ open }) => {
			mockUseSidebar.mockReturnValue({ open })

			render(<Logo />)

			const image = screen.getByTestId('next-image')
			expect(image).toHaveAttribute('data-priority', 'true')
		})
	})

	describe('Accessibility', () => {
		it.each([
			{ open: true, scenario: 'expanded' },
			{ open: false, scenario: 'collapsed' },
		])('should have proper alt text when $scenario', ({ open }) => {
			mockUseSidebar.mockReturnValue({ open })

			render(<Logo />)

			const image = screen.getByRole('img')
			expect(image).toHaveAccessibleName('Crypto logo')
		})
	})

	describe('Conditional rendering', () => {
		it('should switch between expanded and collapsed states', () => {
			// Start with open sidebar
			mockUseSidebar.mockReturnValue({ open: true })
			const { rerender } = render(<Logo />)

			// Should show text when open
			expect(screen.getByText('Crypto')).toBeInTheDocument()
			expect(screen.getByText('Finance app')).toBeInTheDocument()

			// Change to closed sidebar
			mockUseSidebar.mockReturnValue({ open: false })
			rerender(<Logo />)

			// Should not show text when closed
			expect(screen.queryByText('Crypto')).not.toBeInTheDocument()
			expect(screen.queryByText('Finance app')).not.toBeInTheDocument()

			// Image should still be present in both states
			expect(screen.getByRole('img')).toBeInTheDocument()
		})
	})

	describe('Layout structure', () => {
		it('should have correct nested structure when expanded', () => {
			mockUseSidebar.mockReturnValue({ open: true })
			const { container } = render(<Logo />)

			// Check that we have the main container with bg-blue-50
			const mainContainer = container.querySelector('.bg-blue-50')
			expect(mainContainer).toBeInTheDocument()

			// Should contain image container and text container
			const imageContainer = mainContainer?.querySelector('.bg-blue-200')
			const textContainer = mainContainer?.querySelector('.text-blue-600')

			expect(imageContainer).toBeInTheDocument()
			expect(textContainer).toBeInTheDocument()

			// Image should be inside image container
			const image = screen.getByTestId('next-image')
			expect(imageContainer).toContainElement(image)

			// Text should be inside text container
			const cryptoText = screen.getByText('Crypto')
			const financeText = screen.getByText('Finance app')
			expect(textContainer).toContainElement(cryptoText)
			expect(textContainer).toContainElement(financeText)
		})

		it('should have simple structure when collapsed', () => {
			mockUseSidebar.mockReturnValue({ open: false })
			const { container } = render(<Logo />)

			// Get the main container with bg-blue-200 class
			const mainContainer = container.querySelector('.bg-blue-200')
			expect(mainContainer).toBeInTheDocument()

			const image = screen.getByTestId('next-image')

			// Container should directly contain the image
			expect(mainContainer).toContainElement(image)

			// Should not have text containers
			expect(container.querySelector('.text-blue-600')).not.toBeInTheDocument()
		})
	})
})
