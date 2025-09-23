import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { RequiredSymbol } from '@/components/shared/required-symbol'

describe('RequiredSymbol', () => {
	it('renders asterisk symbol', () => {
		render(<RequiredSymbol />)

		expect(screen.getByText('*')).toBeInTheDocument()
	})

	it('renders as a span element', () => {
		render(<RequiredSymbol />)

		const symbolElement = screen.getByText('*')
		expect(symbolElement.tagName).toBe('SPAN')
	})

	it('applies red color class', () => {
		render(<RequiredSymbol />)

		const symbolElement = screen.getByText('*')
		expect(symbolElement).toHaveClass('text-red-500')
	})

	it('has correct text content', () => {
		render(<RequiredSymbol />)

		const symbolElement = screen.getByText('*')
		expect(symbolElement).toHaveTextContent('*')
	})

	it('renders with proper accessibility', () => {
		const { container } = render(<RequiredSymbol />)

		const symbolElement = screen.getByText('*')

		// Check that element is visible and accessible
		expect(symbolElement).toBeVisible()
		expect(container.firstChild).toBe(symbolElement)
	})

	it('has no additional attributes beyond className', () => {
		render(<RequiredSymbol />)

		const symbolElement = screen.getByText('*')
		const attributes = symbolElement.attributes

		// Should only have class attribute
		expect(attributes.length).toBe(1)
		expect(attributes[0].name).toBe('class')
		expect(attributes[0].value).toBe('text-red-500')
	})

	it('renders consistently across multiple instances', () => {
		const { rerender } = render(<RequiredSymbol />)

		const firstRender = screen.getByText('*')
		expect(firstRender).toHaveClass('text-red-500')

		rerender(<RequiredSymbol />)

		const secondRender = screen.getByText('*')
		expect(secondRender).toHaveClass('text-red-500')
		expect(secondRender).toHaveTextContent('*')
	})

	it('can be used in form contexts', () => {
		render(
			<label>
				Username <RequiredSymbol />
			</label>,
		)

		expect(screen.getByText('Username')).toBeInTheDocument()
		expect(screen.getByText('*')).toBeInTheDocument()
		expect(screen.getByText('*')).toHaveClass('text-red-500')
	})

	it('maintains proper spacing when used inline', () => {
		render(
			<div>
				Email
				<RequiredSymbol />
			</div>,
		)

		const container = screen.getByText('*').parentElement
		expect(container).toHaveTextContent('Email*')
	})

	describe('Styling', () => {
		it('has correct Tailwind text color class', () => {
			render(<RequiredSymbol />)

			const symbolElement = screen.getByText('*')
			expect(symbolElement.className).toBe('text-red-500')
		})

		it('does not have any other styling classes', () => {
			render(<RequiredSymbol />)

			const symbolElement = screen.getByText('*')
			const classes = symbolElement.className.split(' ')

			expect(classes).toHaveLength(1)
			expect(classes[0]).toBe('text-red-500')
		})
	})

	describe('Accessibility', () => {
		it('can be targeted by screen readers', () => {
			render(<RequiredSymbol />)

			const symbolElement = screen.getByText('*')

			// Symbol should be readable by screen readers
			expect(symbolElement).not.toHaveAttribute('aria-hidden')
			expect(symbolElement).not.toHaveAttribute('role', 'presentation')
		})

		it('works with form labels for accessibility', () => {
			render(
				<label htmlFor='email'>
					Email Address <RequiredSymbol />
					<input id='email' type='email' />
				</label>,
			)

			const label = screen.getByLabelText(/Email Address/)
			const requiredSymbol = screen.getByText('*')

			expect(label).toBeInTheDocument()
			expect(requiredSymbol).toBeInTheDocument()
		})
	})

	describe('Edge Cases', () => {
		it('renders correctly when wrapped in other components', () => {
			render(
				<div data-testid='wrapper'>
					<RequiredSymbol />
				</div>,
			)

			const wrapper = screen.getByTestId('wrapper')
			const symbol = screen.getByText('*')

			expect(wrapper).toContainElement(symbol)
			expect(symbol).toHaveClass('text-red-500')
		})

		it('maintains functionality in different contexts', () => {
			const contexts = [
				<p key='p'>
					<RequiredSymbol />
				</p>,
				<div key='div'>
					<RequiredSymbol />
				</div>,
				<span key='span'>
					<RequiredSymbol />
				</span>,
			]

			contexts.forEach((context) => {
				const { unmount } = render(context)

				expect(screen.getByText('*')).toHaveClass('text-red-500')

				unmount()
			})
		})
	})
})
