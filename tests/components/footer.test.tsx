import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Footer } from '@/components/shared/footer'

describe('Footer', () => {
	it('renders without crashing', () => {
		render(<Footer />)

		const element = screen.getByTestId('footer')
		expect(element).toBeInTheDocument()
	})

	it('renders as a div element', () => {
		render(<Footer />)

		const element = screen.getByTestId('footer')
		expect(element.tagName).toBe('DIV')
	})

	it('contains a link with correct href', () => {
		render(<Footer />)

		const link = screen.getByTestId('footer-link')
		expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/lev-dmitry')
	})

	it('link opens in a new tab with security attributes', () => {
		render(<Footer />)

		const link = screen.getByTestId('footer-link')
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
	})

	it('displays the correct text', () => {
		render(<Footer />)

		const link = screen.getByTestId('footer-link')
		expect(link).toHaveTextContent('Crypto dashboard 2025 by Sobolev')
	})

	it('applies default CSS classes to the container', () => {
		render(<Footer />)

		const element = screen.getByTestId('footer')
		expect(element).toHaveClass('mt-10', 'mb-3', 'text-center', 'text-xs', 'sm:text-sm', 'md:text-base')
	})
})
