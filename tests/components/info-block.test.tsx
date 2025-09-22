/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { InfoBlock } from '@/components/shared/info-block'

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, width, height }: { src: string; alt: string; width: number; height: number }) => {
		if (!src) return null

		return <img src={src} alt={alt} width={width} height={height} data-testid='next-image' />
	},
}))

// Mock UI components
vi.mock('@/components/ui', () => ({
	Button: ({ children, onClick, variant, size, className }: any) => (
		<button
			onClick={onClick}
			className={className}
			data-testid='button'
			data-variant={variant}
			data-size={size}
		>
			{children}
		</button>
	),
}))

// Mock shared components
vi.mock('@/components/shared/title', () => ({
	Title: ({ text, size, className }: any) => (
		<h1 className={className} data-size={size} data-testid='title'>
			{text}
		</h1>
	),
}))

vi.mock('@/components/shared/modals/auth-modal', () => ({
	AuthModal: ({ open, onClose }: any) =>
		open ? (
			<div data-testid='auth-modal'>
				<button onClick={onClose} data-testid='close-modal'>
					Close
				</button>
			</div>
		) : null,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	ArrowLeftIcon: ({ size }: { size: number }) => (
		<span data-testid='arrow-left-icon' data-size={size}>
			←
		</span>
	),
	RefreshCcwIcon: ({ size }: { size: number }) => (
		<span data-testid='refresh-icon' data-size={size}>
			↻
		</span>
	),
	UserIcon: ({ size }: { size: number }) => (
		<span data-testid='user-icon' data-size={size}>
			👤
		</span>
	),
}))

// Mock utility function
vi.mock('@/lib', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('InfoBlock', () => {
	const mockPush = vi.fn()
	const mockRefresh = vi.fn()

	const defaultProps = {
		type: 'not-found' as const,
		title: 'Test Title',
		text: 'Test description text',
		imageUrl: '/test-image.jpg',
	}

	beforeEach(() => {
		// Setup router mock
		const mockRouter = {
			push: mockPush,
			refresh: mockRefresh,
		}
		vi.mocked(useRouter).mockReturnValue(mockRouter as any)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Rendering', () => {
		it('should render all basic elements correctly', () => {
			render(<InfoBlock {...defaultProps} />)

			// Check title is rendered
			expect(screen.getByTestId('title')).toHaveTextContent('Test Title')

			// Check description text is rendered
			expect(screen.getByText('Test description text')).toBeInTheDocument()

			// Check image is rendered with correct props
			const image = screen.getByTestId('next-image')
			expect(image).toHaveAttribute('src', '/test-image.jpg')
			expect(image).toHaveAttribute('alt', 'Test Title')
			expect(image).toHaveAttribute('width', '300')
			expect(image).toHaveAttribute('height', '300')

			// Check Back button is rendered
			expect(screen.getByText('Back')).toBeInTheDocument()
			expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument()
		})

		it('should apply custom className when provided', () => {
			const { container } = render(<InfoBlock {...defaultProps} className='custom-class' />)

			const mainDiv = container.firstChild as HTMLElement
			expect(mainDiv).toHaveClass('custom-class')
		})

		it('should render title with correct props', () => {
			render(<InfoBlock {...defaultProps} />)

			const title = screen.getByTestId('title')
			expect(title).toHaveAttribute('data-size', 'lg')
			expect(title).toHaveClass('font-extrabold')
		})
	})

	describe('Auth type behavior', () => {
		const authProps = {
			...defaultProps,
			type: 'auth' as const,
		}

		it('should render Sign In button for auth type', () => {
			render(<InfoBlock {...authProps} />)

			expect(screen.getByText('Sign In')).toBeInTheDocument()
			expect(screen.getByTestId('user-icon')).toBeInTheDocument()
			expect(screen.queryByText('Refresh')).not.toBeInTheDocument()
		})

		it('should open auth modal when Sign In button is clicked', async () => {
			render(<InfoBlock {...authProps} />)

			// Initially modal should not be visible
			expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()

			// Click Sign In button
			const signInButton = screen.getByText('Sign In')
			fireEvent.click(signInButton)

			// Modal should now be visible
			await waitFor(() => {
				expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
			})
		})

		it('should close auth modal when onClose is called', async () => {
			render(<InfoBlock {...authProps} />)

			// Open modal
			const signInButton = screen.getByText('Sign In')
			fireEvent.click(signInButton)

			// Wait for modal to appear
			await waitFor(() => {
				expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
			})

			// Close modal
			const closeButton = screen.getByTestId('close-modal')
			fireEvent.click(closeButton)

			// Modal should be closed
			await waitFor(() => {
				expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
			})
		})
	})

	describe('Not-found type behavior', () => {
		it('should render Refresh button for not-found type', () => {
			render(<InfoBlock {...defaultProps} />)

			expect(screen.getByText('Refresh')).toBeInTheDocument()
			expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
			expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
		})

		it('should call router.refresh when Refresh button is clicked', () => {
			render(<InfoBlock {...defaultProps} />)

			const refreshButton = screen.getByText('Refresh')
			fireEvent.click(refreshButton)

			expect(mockRefresh).toHaveBeenCalledTimes(1)
		})
	})

	describe('Navigation', () => {
		it('should navigate to home when Back button is clicked', () => {
			render(<InfoBlock {...defaultProps} />)

			const backButton = screen.getByText('Back')
			fireEvent.click(backButton)

			expect(mockPush).toHaveBeenCalledWith('/')
			expect(mockPush).toHaveBeenCalledTimes(1)
		})
	})

	describe('Button styling', () => {
		it('should have correct button variants and sizes', () => {
			render(<InfoBlock {...defaultProps} />)

			const buttons = screen.getAllByTestId('button')

			// Back button should be default variant
			const backButton = buttons.find((btn) => btn.textContent?.includes('Back'))
			expect(backButton).toHaveAttribute('data-variant', 'default')
			expect(backButton).toHaveAttribute('data-size', 'lg')

			// Second button (Refresh) should be outline variant
			const refreshButton = buttons.find((btn) => btn.textContent?.includes('Refresh'))
			expect(refreshButton).toHaveAttribute('data-variant', 'outline')
			expect(refreshButton).toHaveAttribute('data-size', 'lg')
		})

		it('should have correct CSS classes on buttons', () => {
			render(<InfoBlock {...defaultProps} />)

			const buttons = screen.getAllByTestId('button')

			buttons.forEach((button) => {
				expect(button).toHaveClass('rounded-xl')
				expect(button).toHaveClass('transition-colors')
				expect(button).toHaveClass('duration-300')
				expect(button).toHaveClass('ease-in-out')
			})
		})
	})

	describe('Icons', () => {
		it('should render icons with correct size', () => {
			render(<InfoBlock {...defaultProps} />)

			const arrowIcon = screen.getByTestId('arrow-left-icon')
			const refreshIcon = screen.getByTestId('refresh-icon')

			expect(arrowIcon).toHaveAttribute('data-size', '16')
			expect(refreshIcon).toHaveAttribute('data-size', '16')
		})

		it('should render user icon for auth type', () => {
			const authProps = { ...defaultProps, type: 'auth' as const }
			render(<InfoBlock {...authProps} />)

			const userIcon = screen.getByTestId('user-icon')
			expect(userIcon).toHaveAttribute('data-size', '16')
		})
	})

	describe('Edge cases', () => {
		it('should handle empty strings in props', () => {
			const emptyProps = {
				...defaultProps,
				title: '',
				text: '',
				imageUrl: '',
			}

			render(<InfoBlock {...emptyProps} />)

			expect(screen.getByTestId('title')).toHaveTextContent('')

			// Check that image element does not exist when imageUrl is empty
			expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
			expect(screen.queryByRole('img')).not.toBeInTheDocument()
		})

		// Add test for valid image URL
		it('should render image when imageUrl is provided', () => {
			render(<InfoBlock {...defaultProps} />)

			const image = screen.getByTestId('next-image')
			expect(image).toBeInTheDocument()
			expect(image).toHaveAttribute('src', '/test-image.jpg')
			expect(image).toHaveAttribute('alt', 'Test Title')
		})

		// Test for null/undefined imageUrl
		it('should handle null or undefined imageUrl', () => {
			const nullImageProps = {
				...defaultProps,
				imageUrl: null as any, // or undefined
			}

			render(<InfoBlock {...nullImageProps} />)

			expect(screen.queryByTestId('next-image')).not.toBeInTheDocument()
			expect(screen.queryByRole('img')).not.toBeInTheDocument()
		})

		it('should handle special characters in title and text', () => {
			const specialProps = {
				...defaultProps,
				title: 'Title with <special> & characters',
				text: 'Text with "quotes" & ampersands',
			}

			render(<InfoBlock {...specialProps} />)

			expect(screen.getByTestId('title')).toHaveTextContent('Title with <special> & characters')
			expect(screen.getByText('Text with "quotes" & ampersands')).toBeInTheDocument()
		})

		it('should not render AuthModal for non-auth types', () => {
			render(<InfoBlock {...defaultProps} />)

			// Modal should not exist initially
			expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()

			// Even after clicking buttons, auth modal should not appear for non-auth type
			const refreshButton = screen.getByText('Refresh')
			fireEvent.click(refreshButton)

			expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
		})
	})

	describe('Accessibility', () => {
		it('should have proper alt text for image', () => {
			render(<InfoBlock {...defaultProps} />)

			const image = screen.getByRole('img')
			expect(image).toHaveAttribute('alt', 'Test Title')
		})

		it('should have clickable buttons', () => {
			render(<InfoBlock {...defaultProps} />)

			const buttons = screen.getAllByRole('button')
			expect(buttons).toHaveLength(2) // Back button and Refresh button

			buttons.forEach((button) => {
				expect(button).toBeEnabled()
			})
		})
	})
})
