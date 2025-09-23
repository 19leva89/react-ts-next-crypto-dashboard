import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Title } from '@/components/shared/title'

// Mock clsx
vi.mock('clsx', () => ({
	default: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

describe('Title', () => {
	describe('Basic rendering', () => {
		it('renders with required text prop', () => {
			render(<Title text='Hello World' />)

			expect(screen.getByText('Hello World')).toBeInTheDocument()
		})

		it('uses default size when no size prop provided', () => {
			render(<Title text='Default Title' />)

			const titleElement = screen.getByText('Default Title')
			expect(titleElement.tagName).toBe('H4') // default size 'sm' maps to 'h4'
			expect(titleElement).toHaveClass('text-[22px]') // default size 'sm' class
		})

		it('renders empty text correctly', () => {
			render(<Title text='' />)

			const titleElement = screen.getByRole('heading')
			expect(titleElement).toHaveTextContent('')
		})
	})

	describe('Size mapping', () => {
		it('maps xs size to h5 tag and correct class', () => {
			render(<Title text='Extra Small' size='xs' />)

			const titleElement = screen.getByText('Extra Small')
			expect(titleElement.tagName).toBe('H5')
			expect(titleElement).toHaveClass('text-[16px]')
		})

		it('maps sm size to h4 tag and correct class', () => {
			render(<Title text='Small' size='sm' />)

			const titleElement = screen.getByText('Small')
			expect(titleElement.tagName).toBe('H4')
			expect(titleElement).toHaveClass('text-[22px]')
		})

		it('maps md size to h3 tag and correct class', () => {
			render(<Title text='Medium' size='md' />)

			const titleElement = screen.getByText('Medium')
			expect(titleElement.tagName).toBe('H3')
			expect(titleElement).toHaveClass('text-[26px]')
		})

		it('maps lg size to h2 tag and correct class', () => {
			render(<Title text='Large' size='lg' />)

			const titleElement = screen.getByText('Large')
			expect(titleElement.tagName).toBe('H2')
			expect(titleElement).toHaveClass('text-[32px]')
		})

		it('maps xl size to h1 tag and correct class', () => {
			render(<Title text='Extra Large' size='xl' />)

			const titleElement = screen.getByText('Extra Large')
			expect(titleElement.tagName).toBe('H1')
			expect(titleElement).toHaveClass('text-[40px]')
		})

		it('maps 2xl size to h1 tag and correct class', () => {
			render(<Title text='2X Large' size='2xl' />)

			const titleElement = screen.getByText('2X Large')
			expect(titleElement.tagName).toBe('H1')
			expect(titleElement).toHaveClass('text-[48px]')
		})
	})

	describe('Custom className', () => {
		it('applies custom className along with size class', () => {
			render(<Title text='Custom Title' size='md' className='font-bold text-blue-500' />)

			const titleElement = screen.getByText('Custom Title')
			expect(titleElement).toHaveClass('text-[26px]') // size class
			expect(titleElement).toHaveClass('font-bold', 'text-blue-500') // custom classes
		})

		it('works with custom className and default size', () => {
			render(<Title text='Custom Default' className='tracking-wide uppercase' />)

			const titleElement = screen.getByText('Custom Default')
			expect(titleElement).toHaveClass('text-[22px]') // default size class
			expect(titleElement).toHaveClass('uppercase', 'tracking-wide') // custom classes
		})

		it('handles undefined className gracefully', () => {
			render(<Title text='No Custom Class' size='lg' className={undefined} />)

			const titleElement = screen.getByText('No Custom Class')
			expect(titleElement).toHaveClass('text-[32px]')
			expect(titleElement.className).toBe('text-[32px]')
		})

		it('handles empty string className', () => {
			render(<Title text='Empty Class' size='sm' className='' />)

			const titleElement = screen.getByText('Empty Class')
			expect(titleElement).toHaveClass('text-[22px]')
		})
	})

	describe('createElement usage', () => {
		it('creates proper HTML elements using createElement', () => {
			const { container } = render(<Title text='Test Element' size='lg' />)

			const h2Element = container.querySelector('h2')
			expect(h2Element).not.toBeNull()
			expect(h2Element?.textContent).toBe('Test Element')
		})

		it('passes all props correctly to createElement', () => {
			render(<Title text='Props Test' size='xl' className='test-class' />)

			const titleElement = screen.getByText('Props Test')
			expect(titleElement.tagName).toBe('H1')
			expect(titleElement).toHaveClass('text-[40px]', 'test-class')
			expect(titleElement.textContent).toBe('Props Test')
		})
	})

	describe('Accessibility', () => {
		it('creates proper heading hierarchy with different sizes', () => {
			render(
				<div>
					<Title text='Main Title' size='xl' />
					<Title text='Section Title' size='lg' />
					<Title text='Subsection Title' size='md' />
				</div>,
			)

			expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument()
			expect(screen.getByRole('heading', { level: 2, name: 'Section Title' })).toBeInTheDocument()
			expect(screen.getByRole('heading', { level: 3, name: 'Subsection Title' })).toBeInTheDocument()
		})

		it('maintains semantic meaning with heading roles', () => {
			render(<Title text='Accessible Title' size='md' />)

			const heading = screen.getByRole('heading')
			expect(heading).toBeInTheDocument()
			expect(heading.tagName).toBe('H3')
		})
	})

	describe('Text content handling', () => {
		it('handles special characters in text', () => {
			const specialText = 'Title with <>&"\' special chars'
			render(<Title text={specialText} />)

			expect(screen.getByText(specialText)).toBeInTheDocument()
		})

		it('handles numeric text', () => {
			render(<Title text='123456' size='lg' />)

			expect(screen.getByText('123456')).toBeInTheDocument()
			expect(screen.getByText('123456').tagName).toBe('H2')
		})

		it('handles multiline text', () => {
			const multilineText = 'Line 1\nLine 2\nLine 3'
			render(<Title text={multilineText} />)

			const heading = screen.getByRole('heading', { name: multilineText })
			expect(heading).toBeInTheDocument()
			expect(heading.tagName).toMatch(/^H[1-6]$/i)
		})

		it('handles text with spaces and special formatting', () => {
			const formattedText = '  Title with   spaces  '
			render(<Title text={formattedText} />)

			expect(
				screen.getByText((content, element) => {
					return !!(element?.tagName?.match(/^H[1-6]$/) && element?.textContent === formattedText)
				}),
			).toBeInTheDocument()
		})
	})

	describe('Type safety and edge cases', () => {
		it('handles all valid size values', () => {
			const sizes: Array<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

			sizes.forEach((size) => {
				const { unmount } = render(<Title text={`Title ${size}`} size={size} />)
				expect(screen.getByText(`Title ${size}`)).toBeInTheDocument()
				unmount()
			})
		})

		it('works with complex className combinations', () => {
			const complexClassName =
				'font-semibold text-gray-800 dark:text-white hover:text-blue-600 transition-colors duration-200'
			render(<Title text='Complex Styling' size='lg' className={complexClassName} />)

			const titleElement = screen.getByText('Complex Styling')
			expect(titleElement).toHaveClass('text-[32px]')
			complexClassName.split(' ').forEach((cls) => {
				expect(titleElement).toHaveClass(cls)
			})
		})
	})

	describe('Integration with clsx', () => {
		it('properly combines classes using clsx', () => {
			render(<Title text='Clsx Test' size='md' className='custom-class' />)

			const titleElement = screen.getByText('Clsx Test')
			expect(titleElement.className).toBe('text-[26px] custom-class')
		})

		it('handles falsy className values', () => {
			render(<Title text='Falsy Class' size='sm' className={false as any} />)

			const titleElement = screen.getByText('Falsy Class')
			expect(titleElement).toHaveClass('text-[22px]')
		})
	})

	describe('Component consistency', () => {
		it('renders the same output for same props', () => {
			const { rerender } = render(<Title text='Consistent' size='lg' className='test' />)

			const firstRender = screen.getByText('Consistent')
			expect(firstRender.tagName).toBe('H2')
			expect(firstRender).toHaveClass('text-[32px]', 'test')

			rerender(<Title text='Consistent' size='lg' className='test' />)

			const secondRender = screen.getByText('Consistent')
			expect(secondRender.tagName).toBe('H2')
			expect(secondRender).toHaveClass('text-[32px]', 'test')
		})

		it('updates correctly when props change', () => {
			const { rerender } = render(<Title text='Initial' size='sm' />)

			expect(screen.getByText('Initial').tagName).toBe('H4')

			rerender(<Title text='Updated' size='xl' />)

			expect(screen.getByText('Updated').tagName).toBe('H1')
			expect(screen.queryByText('Initial')).not.toBeInTheDocument()
		})
	})
})
