import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Container } from '@/components/shared/container'

// Mock cn utility
vi.mock('@/lib', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('Container', () => {
	it('renders children correctly', () => {
		render(
			<Container>
				<span data-testid='child'>Hello</span>
			</Container>,
		)

		expect(screen.getByTestId('child')).toBeInTheDocument()
		expect(screen.getByTestId('container')).toContainElement(screen.getByTestId('child'))
	})

	it('renders as a div element', () => {
		render(<Container>Content</Container>)

		const element = screen.getByTestId('container')
		expect(element.tagName).toBe('DIV')
	})

	it('applies default CSS classes', () => {
		render(<Container>Content</Container>)

		const element = screen.getByTestId('container')
		expect(element).toHaveClass('mx-auto', 'max-w-320')
	})

	it('applies custom className alongside default classes', () => {
		const customClass = 'bg-red-500 p-4'
		render(<Container className={customClass}>Content</Container>)

		const element = screen.getByTestId('container')
		expect(element).toHaveClass('mx-auto', 'max-w-320', 'bg-red-500', 'p-4')
	})

	it('works without className prop', () => {
		render(<Container>Content</Container>)

		const element = screen.getByTestId('container')
		expect(element).toHaveClass('mx-auto', 'max-w-320')
		expect(element.className).not.toContain('undefined')
		expect(element.className).not.toContain('null')
	})

	it('renders multiple children correctly', () => {
		render(
			<Container>
				<span data-testid='child-1'>Child 1</span>
				<span data-testid='child-2'>Child 2</span>
			</Container>,
		)

		expect(screen.getByTestId('child-1')).toBeInTheDocument()
		expect(screen.getByTestId('child-2')).toBeInTheDocument()
	})

	it('does not throw console errors', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(<Container>Safe render</Container>)

		expect(consoleSpy).not.toHaveBeenCalled()
		consoleSpy.mockRestore()
	})
})
