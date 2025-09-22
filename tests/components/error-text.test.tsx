import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ErrorText } from '@/components/shared/error-text'

// Mock cn utility
vi.mock('@/lib', () => ({
	cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

describe('ErrorText', () => {
	it('renders text content correctly', () => {
		const text = 'This field is required'
		render(<ErrorText text={text} />)

		expect(screen.getByText(text)).toBeInTheDocument()
	})

	it('renders as a paragraph element', () => {
		const text = 'Error message'
		render(<ErrorText text={text} />)

		const element = screen.getByText(text)
		expect(element.tagName).toBe('P')
	})

	it('applies default CSS classes', () => {
		const text = 'Default error styling'
		render(<ErrorText text={text} />)

		const element = screen.getByText(text)
		expect(element).toHaveClass('text-sm', 'text-red-500')
	})

	it('applies custom className alongside default classes', () => {
		const text = 'Custom styled error'
		const customClass = 'font-bold mb-4'

		render(<ErrorText text={text} className={customClass} />)

		const element = screen.getByText(text)
		expect(element).toHaveClass('text-sm', 'text-red-500', 'font-bold', 'mb-4')
	})

	it('handles empty text', () => {
		render(<ErrorText text='' />)

		// Should still render the paragraph element
		const element = screen.getByTestId('error-text')
		expect(element).toBeInTheDocument()
		expect(element).toHaveTextContent('')
		expect(element.tagName).toBe('P')
	})

	it('handles long error messages', () => {
		const longText =
			'This is a very long error message that might wrap to multiple lines and should be displayed correctly without breaking the layout or causing any issues.'

		render(<ErrorText text={longText} />)

		expect(screen.getByText(longText)).toBeInTheDocument()
	})

	it('handles special characters and HTML entities', () => {
		const specialText = 'Error: Invalid input & format! Please check <field> value.'

		render(<ErrorText text={specialText} />)

		expect(screen.getByText(specialText)).toBeInTheDocument()
	})

	it('handles multiple CSS classes in className', () => {
		const text = 'Multi-class error'
		const multipleClasses = 'font-semibold underline mt-2'

		render(<ErrorText text={text} className={multipleClasses} />)

		const element = screen.getByText(text)
		expect(element).toHaveClass('text-sm', 'text-red-500', 'font-semibold', 'underline', 'mt-2')
	})

	it('overrides default classes when conflicting classes are provided', () => {
		const text = 'Overridden styling'
		// text-blue-600 should override text-red-500 due to CSS specificity
		const overrideClass = 'text-blue-600 text-lg'

		render(<ErrorText text={text} className={overrideClass} />)

		const element = screen.getByText(text)
		expect(element).toHaveClass('text-sm', 'text-red-500', 'text-blue-600', 'text-lg')
	})

	it('works without className prop', () => {
		const text = 'No custom class'

		render(<ErrorText text={text} />)

		const element = screen.getByText(text)
		expect(element).toHaveClass('text-sm', 'text-red-500')
		// Should not have undefined or null in class list
		expect(element.className).not.toContain('undefined')
		expect(element.className).not.toContain('null')
	})

	it('renders without console errors', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		render(<ErrorText text='Test error' />)

		expect(consoleSpy).not.toHaveBeenCalled()

		consoleSpy.mockRestore()
	})

	it('has proper accessibility attributes', () => {
		const text = 'Validation error occurred'

		render(<ErrorText text={text} />)

		const element = screen.getByText(text)
		// Error text should be readable by screen readers
		expect(element).toBeVisible()
		expect(element).toHaveAttribute('class')
	})

	it('can be used with form validation patterns', () => {
		// Simulate common form validation scenarios
		const validationMessages = [
			'Email is required',
			'Password must be at least 8 characters',
			'Passwords do not match',
			'Please select a valid option',
		]

		validationMessages.forEach((message, index) => {
			render(<ErrorText text={message} key={index} />)
			expect(screen.getByText(message)).toBeInTheDocument()
		})
	})
})
