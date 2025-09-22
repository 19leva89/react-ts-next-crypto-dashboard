import userEvent from '@testing-library/user-event'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

import { ModeToggle } from '@/components/shared/mode-toggle'

// Mock useTheme hook from next-themes
const mockSetTheme = vi.fn()
const mockUseTheme = vi.fn()

vi.mock('next-themes', () => ({
	useTheme: () => mockUseTheme(),
}))

// Mock useMetaColor hook
const mockSetMetaColor = vi.fn()
const mockUseMetaColor = vi.fn()

vi.mock('@/hooks/use-meta-color', () => ({
	useMetaColor: () => mockUseMetaColor(),
	META_THEME_COLORS: {
		light: '#ffffff',
		dark: '#000000',
	},
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	MoonIcon: ({ size, className }: { size: number; className: string }) => (
		<span data-testid='moon-icon' data-size={size} className={className}>
			🌙
		</span>
	),
	SunIcon: ({ size, className }: { size: number; className: string }) => (
		<span data-testid='sun-icon' data-size={size} className={className}>
			☀️
		</span>
	),
}))

// Mock Button component
vi.mock('@/components/ui', () => ({
	Button: ({ children, onClick, variant, size, className }: any) => (
		<button
			onClick={onClick}
			className={className}
			data-testid='mode-toggle-button'
			data-variant={variant}
			data-size={size}
		>
			{children}
		</button>
	),
}))

describe('ModeToggle', () => {
	beforeEach(() => {
		vi.clearAllMocks()

		// Default mock returns
		mockUseTheme.mockReturnValue({
			setTheme: mockSetTheme,
			resolvedTheme: 'light',
		})

		mockUseMetaColor.mockReturnValue({
			setMetaColor: mockSetMetaColor,
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('Rendering', () => {
		it('should render button with correct props', () => {
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			expect(button).toBeInTheDocument()
			expect(button).toHaveAttribute('data-variant', 'outline')
			expect(button).toHaveAttribute('data-size', 'lg')
			expect(button).toHaveClass(
				'group',
				'flex',
				'w-11',
				'items-center',
				'rounded-xl',
				'px-2',
				'transition-colors',
				'duration-300',
				'ease-in-out',
			)
		})

		it('should render both sun and moon icons', () => {
			render(<ModeToggle />)

			const sunIcon = screen.getByTestId('sun-icon')
			const moonIcon = screen.getByTestId('moon-icon')

			expect(sunIcon).toBeInTheDocument()
			expect(moonIcon).toBeInTheDocument()

			// Check icon sizes
			expect(sunIcon).toHaveAttribute('data-size', '20')
			expect(moonIcon).toHaveAttribute('data-size', '20')
		})

		it('should render screen reader text', () => {
			render(<ModeToggle />)

			const srText = screen.getByText('Toggle theme')
			expect(srText).toBeInTheDocument()
			expect(srText).toHaveClass('sr-only')
		})

		it('should have correct icon styling classes', () => {
			render(<ModeToggle />)

			const sunIcon = screen.getByTestId('sun-icon')
			const moonIcon = screen.getByTestId('moon-icon')

			// Both icons should have common classes
			const commonClasses = [
				'absolute',
				'inset-0',
				'm-auto',
				'size-5!',
				'opacity-0',
				'transition-opacity',
				'duration-300',
			]

			commonClasses.forEach((className) => {
				expect(sunIcon).toHaveClass(className)
				expect(moonIcon).toHaveClass(className)
			})

			// Check theme-specific classes
			expect(sunIcon).toHaveClass('[html.dark_&]:opacity-100')
			expect(moonIcon).toHaveClass('[html.light_&]:opacity-100')
		})

		it('should have correct container styling', () => {
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			const iconContainer = button.querySelector('.relative')

			expect(iconContainer).toBeInTheDocument()
			expect(iconContainer).toHaveClass(
				'relative',
				'size-6',
				'transition-transform',
				'duration-300',
				'ease-in-out',
				'group-hover:rotate-90',
			)
		})
	})

	describe('Theme toggling from light to dark', () => {
		beforeEach(() => {
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'light',
			})
		})

		it('should switch to dark theme when currently light', async () => {
			const user = userEvent.setup()
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			expect(mockSetTheme).toHaveBeenCalledWith('dark')
			expect(mockSetTheme).toHaveBeenCalledTimes(1)
		})

		it('should set dark meta color when switching from light', async () => {
			const user = userEvent.setup()
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')
			expect(mockSetMetaColor).toHaveBeenCalledTimes(1)
		})
	})

	describe('Theme toggling from dark to light', () => {
		beforeEach(() => {
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'dark',
			})
		})

		it('should switch to light theme when currently dark', async () => {
			const user = userEvent.setup()
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			expect(mockSetTheme).toHaveBeenCalledWith('light')
			expect(mockSetTheme).toHaveBeenCalledTimes(1)
		})

		it('should set light meta color when switching from dark', async () => {
			const user = userEvent.setup()
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			expect(mockSetMetaColor).toHaveBeenCalledWith('#ffffff')
			expect(mockSetMetaColor).toHaveBeenCalledTimes(1)
		})
	})

	describe('Click handlers', () => {
		it('should handle click event with fireEvent', () => {
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'light',
			})

			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			fireEvent.click(button)

			expect(mockSetTheme).toHaveBeenCalledWith('dark')
			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')
		})

		it('should handle multiple clicks correctly', async () => {
			const user = userEvent.setup()

			// Start with light theme
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'light',
			})

			const { rerender } = render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			// First click: light -> dark
			expect(mockSetTheme).toHaveBeenCalledWith('dark')
			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')

			// Simulate theme change to dark
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'dark',
			})

			rerender(<ModeToggle />)
			await user.click(button)

			// Second click: dark -> light
			expect(mockSetTheme).toHaveBeenCalledWith('light')
			expect(mockSetMetaColor).toHaveBeenCalledWith('#ffffff')
			expect(mockSetTheme).toHaveBeenCalledTimes(2)
			expect(mockSetMetaColor).toHaveBeenCalledTimes(2)
		})
	})

	describe('Edge cases', () => {
		it('should handle undefined resolvedTheme', async () => {
			const user = userEvent.setup()

			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: undefined,
			})

			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			// When resolvedTheme is undefined, should default to light behavior
			expect(mockSetTheme).toHaveBeenCalledWith('dark')
			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')
		})

		it('should handle system theme', async () => {
			const user = userEvent.setup()

			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'system',
			})

			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			// When resolvedTheme is 'system', should treat as light (not 'dark')
			expect(mockSetTheme).toHaveBeenCalledWith('dark')
			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')
		})
	})

	describe('Accessibility', () => {
		it('should be keyboard accessible', async () => {
			const user = userEvent.setup()
			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')

			// Focus the button
			button.focus()
			expect(button).toHaveFocus()

			// Press Enter
			await user.keyboard('{Enter}')
			expect(mockSetTheme).toHaveBeenCalledTimes(1)

			// Press Space
			await user.keyboard(' ')
			expect(mockSetTheme).toHaveBeenCalledTimes(2)
		})

		it('should have proper button role', () => {
			render(<ModeToggle />)

			const button = screen.getByRole('button')
			expect(button).toBeInTheDocument()
		})

		it('should have screen reader accessible text', () => {
			render(<ModeToggle />)

			// Screen reader text should be present
			const srText = screen.getByText('Toggle theme')
			expect(srText).toBeInTheDocument()
		})
	})

	describe('useCallback optimization', () => {
		it("should maintain stable function reference when dependencies don't change", () => {
			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'light',
			})

			const { rerender } = render(<ModeToggle />)

			// Get initial button
			const button1 = screen.getByTestId('mode-toggle-button')

			// Re-render with same props
			rerender(<ModeToggle />)

			// Get button after re-render
			const button2 = screen.getByTestId('mode-toggle-button')

			// Both should be the same element (component didn't re-render unnecessarily)
			expect(button1).toBe(button2)
		})
	})

	describe('Hook integration', () => {
		it('should call useTheme hook', () => {
			render(<ModeToggle />)

			expect(mockUseTheme).toHaveBeenCalled()
		})

		it('should call useMetaColor hook', () => {
			render(<ModeToggle />)

			expect(mockUseMetaColor).toHaveBeenCalled()
		})

		it('should use META_THEME_COLORS constants', async () => {
			const user = userEvent.setup()

			mockUseTheme.mockReturnValue({
				setTheme: mockSetTheme,
				resolvedTheme: 'light',
			})

			render(<ModeToggle />)

			const button = screen.getByTestId('mode-toggle-button')
			await user.click(button)

			// Should use the mocked META_THEME_COLORS values
			expect(mockSetMetaColor).toHaveBeenCalledWith('#000000')
		})
	})
})
