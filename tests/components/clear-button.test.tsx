import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import { ClearButton } from '@/components/shared/clear-button'

// Mock lucide-react
vi.mock('lucide-react', () => ({
	DeleteIcon: ({ size }: { size: number }) => (
		<svg data-testid='delete-icon' width={size} height={size}>
			<title>Delete Icon</title>
		</svg>
	),
}))

// Mock cn
vi.mock('@/lib', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('ClearButton', () => {
	it('renders with correct base styles', () => {
		render(<ClearButton />)

		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()
		expect(button).toHaveAttribute('type', 'button')

		// Check icon presence
		const icon = screen.getByTestId('delete-icon')
		expect(icon).toBeInTheDocument()
		expect(icon).toHaveAttribute('width', '20')
		expect(icon).toHaveAttribute('height', '20')
	})

	it('applies base CSS classes', () => {
		render(<ClearButton />)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('absolute', 'top-1/2', 'right-4', '-translate-y-1/2')
		expect(button).toHaveClass('cursor-pointer', 'opacity-30', 'transition-opacity')
		expect(button).toHaveClass('duration-300', 'ease-in-out', 'hover:opacity-100')
	})

	it('applies additional CSS classes from className', () => {
		render(<ClearButton className='custom-class another-class' />)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('custom-class', 'another-class')
		// Base classes should also remain
		expect(button).toHaveClass('absolute', 'cursor-pointer')
	})

	it('calls onClick when clicked', async () => {
		const handleClick = vi.fn()
		const user = userEvent.setup()

		render(<ClearButton onClick={handleClick} />)

		const button = screen.getByRole('button')
		await user.click(button)

		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('does not throw an error when clicked without onClick', async () => {
		const user = userEvent.setup()

		render(<ClearButton />)

		const button = screen.getByRole('button')

		// Should not throw an error
		await expect(user.click(button)).resolves.not.toThrow()
	})

	it('is accessible via keyboard', async () => {
		const handleClick = vi.fn()
		const user = userEvent.setup()

		render(<ClearButton onClick={handleClick} />)

		const button = screen.getByRole('button')
		button.focus()

		// Press Enter
		await user.keyboard('{Enter}')
		expect(handleClick).toHaveBeenCalledTimes(1)

		// Press Space
		await user.keyboard(' ')
		expect(handleClick).toHaveBeenCalledTimes(2)
	})

	it('has correct structure for screen readers', () => {
		render(<ClearButton />)

		const button = screen.getByRole('button')
		expect(button).toBeInTheDocument()

		// Check icon presence with title for accessibility
		const icon = screen.getByTitle('Delete Icon')
		expect(icon).toBeInTheDocument()
	})
})
