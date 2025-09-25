/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { FormImage } from '@/components/shared/form/form-image'

// Mock next/image component
vi.mock('next/image', () => ({
	default: ({ unoptimized, ...props }: any) => {
		return <img {...props} />
	},
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
	XIcon: (props: any) => (
		<span data-testid='x-icon' {...props}>
			×
		</span>
	),
	ImageIcon: (props: any) => (
		<span data-testid='image-icon' {...props}>
			📷
		</span>
	),
	UploadIcon: (props: any) => (
		<span data-testid='upload-icon' {...props}>
			⬆️
		</span>
	),
}))

// Mock custom components
vi.mock('@/components/ui', () => ({
	Input: ({ className, ...props }: any) => <input className={className} {...props} />,
}))

vi.mock('@/components/shared', () => ({
	ErrorText: ({ text, className }: any) => <span className={className}>{text}</span>,
	RequiredSymbol: () => <span data-testid='required-symbol'>*</span>,
}))

// Mock utility function
vi.mock('@/lib', () => ({
	cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// Test wrapper component with form context
const TestWrapper = ({ children, defaultValues = {} }: any) => {
	const methods = useForm({ defaultValues })
	return <FormProvider {...methods}>{children}</FormProvider>
}

describe('FormImage', () => {
	// Sample test file
	const createTestFile = (name: string, type: string, size: number) => {
		const file = new File([''], name, { type })
		Object.defineProperty(file, 'size', { value: size })
		return file
	}

	const mockImageFile = createTestFile('test.jpg', 'image/jpeg', 1024 * 1024) // 1MB
	const mockLargeFile = createTestFile('large.jpg', 'image/jpeg', 6 * 1024 * 1024) // 6MB
	const mockTextFile = createTestFile('test.txt', 'text/plain', 1024)

	let mockFileReaderInstance: any

	beforeEach(() => {
		vi.clearAllMocks()

		// Create a mock FileReader that properly simulates async behavior
		mockFileReaderInstance = {
			readAsDataURL: vi.fn(function (this: any) {
				// Simulate async file reading
				setTimeout(() => {
					if (this.onload) {
						this.result = 'data:image/jpeg;base64,mock-data'
						this.onload({ target: { result: this.result } })
					}
				}, 0)
			}),
			onload: null,
			onerror: null,
			result: null,
			readyState: 0,
			abort: vi.fn(),
			DONE: 2,
			EMPTY: 0,
			LOADING: 1,
		}

		global.FileReader = vi.fn(() => mockFileReaderInstance) as any
	})

	afterEach(() => {
		vi.clearAllTimers()
	})

	it('renders with label and placeholder', () => {
		render(
			<TestWrapper>
				<FormImage name='avatar' label='Profile Image' placeholder='Click to upload image' />
			</TestWrapper>,
		)

		expect(screen.getByText('Profile Image')).toBeInTheDocument()
		expect(screen.getByText('Click to upload image')).toBeInTheDocument()
	})

	it('shows required symbol when required prop is true', () => {
		render(
			<TestWrapper>
				<FormImage name='avatar' label='Avatar' required />
			</TestWrapper>,
		)

		expect(screen.getByTestId('required-symbol')).toBeInTheDocument()
	})

	it('opens file dialog when click on drop zone', () => {
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' />
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		const dropZone = screen.getByLabelText('Upload image (click or drag and drop)')

		// Mock click handler - reset calls before test
		const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})

		fireEvent.click(dropZone)

		// Check that click was called at least once
		expect(clickSpy).toHaveBeenCalled()

		clickSpy.mockRestore()
	})

	it('handles file selection via input', async () => {
		const mockOnFileChange = vi.fn()
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' onFileChange={mockOnFileChange} />
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

		// Trigger file change event
		fireEvent.change(fileInput, { target: { files: [mockImageFile] } })

		// Wait for FileReader to complete
		await waitFor(() => {
			expect(mockOnFileChange).toHaveBeenCalledWith(mockImageFile)
		})
	})

	it('validates file type and shows error for non-image files', async () => {
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' />
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		fireEvent.change(fileInput, { target: { files: [mockTextFile] } })

		await waitFor(() => {
			expect(screen.getByText('The file must be an image')).toBeInTheDocument()
		})
	})

	it('validates file size and shows error for oversized files', async () => {
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' maxSize={5 * 1024 * 1024} /> {/* 5MB max */}
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		fireEvent.change(fileInput, { target: { files: [mockLargeFile] } })

		await waitFor(() => {
			expect(screen.getByText('The image size must be less than 5MB')).toBeInTheDocument()
		})
	})

	it('handles drag and drop events', async () => {
		render(
			<TestWrapper>
				<FormImage name='avatar' />
			</TestWrapper>,
		)

		const dropZone = screen.getByLabelText('Upload image (click or drag and drop)')

		// Test drag over
		fireEvent.dragOver(dropZone)
		expect(dropZone).toHaveClass('border-primary')

		// Test drag leave
		fireEvent.dragLeave(dropZone)

		// Test drop with valid file
		fireEvent.drop(dropZone, {
			dataTransfer: { files: [mockImageFile] },
		})

		// Wait for drag over state to clear
		await waitFor(() => {
			expect(dropZone).not.toHaveClass('border-primary')
		})
	})

	it('clears selected file when clear button is clicked', async () => {
		const mockOnFileChange = vi.fn()
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' onFileChange={mockOnFileChange} />
			</TestWrapper>,
		)

		// First select a file
		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		fireEvent.change(fileInput, { target: { files: [mockImageFile] } })

		// Wait for preview to appear
		await waitFor(() => {
			expect(screen.getByAltText('Preview')).toBeInTheDocument()
		})

		// Find and click clear button
		const clearButton = screen.getByTestId('x-icon').closest('button')
		expect(clearButton).toBeInTheDocument()

		fireEvent.click(clearButton!)

		await waitFor(() => {
			expect(mockOnFileChange).toHaveBeenCalledWith(null)
		})
	})

	it('disables interaction when disabled prop is true', () => {
		render(
			<TestWrapper>
				<FormImage name='avatar' disabled />
			</TestWrapper>,
		)

		const dropZone = screen.getByLabelText('Image upload disabled')
		expect(dropZone).toHaveClass('cursor-not-allowed')
		expect(dropZone).toHaveClass('opacity-50')

		// File input should be disabled
		const fileInput = screen.getByLabelText('Image upload disabled')
		expect(fileInput).toBeInTheDocument()
	})

	it('displays error message when there is a form error', async () => {
		// Create form with initial error using custom component
		const ErrorWrapper = ({ children }: any) => {
			const methods = useForm()

			// Use useEffect to set error after initial render to avoid infinite loop
			React.useEffect(() => {
				methods.setError('avatar', { type: 'required', message: 'This field is required' })
			}, [methods])

			return <FormProvider {...methods}>{children}</FormProvider>
		}

		render(
			<ErrorWrapper>
				<FormImage name='avatar' />
			</ErrorWrapper>,
		)

		// Wait for error to be set and displayed
		await waitFor(() => {
			expect(screen.getByText('This field is required')).toBeInTheDocument()
		})
	})

	it('shows image preview when file is selected', async () => {
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' />
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		fireEvent.change(fileInput, { target: { files: [mockImageFile] } })

		await waitFor(() => {
			expect(screen.getByAltText('Preview')).toBeInTheDocument()
		})
	})

	describe('keyboard navigation', () => {
		it('triggers file input click when Enter is pressed', () => {
			const { container } = render(
				<TestWrapper>
					<FormImage name='avatar' />
				</TestWrapper>,
			)

			const dropZone = screen.getByLabelText('Upload image (click or drag and drop)')
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

			// Create a fresh spy for this test
			const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})

			fireEvent.keyDown(dropZone, { key: 'Enter' })
			expect(clickSpy).toHaveBeenCalled()

			clickSpy.mockRestore()
		})

		it('triggers file input click when Space is pressed', () => {
			const { container } = render(
				<TestWrapper>
					<FormImage name='avatar' />
				</TestWrapper>,
			)

			const dropZone = screen.getByLabelText('Upload image (click or drag and drop)')
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

			const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})

			fireEvent.keyDown(dropZone, { key: ' ' })
			expect(clickSpy).toHaveBeenCalled()

			clickSpy.mockRestore()
		})

		it('does not trigger file input click for other keys', () => {
			const { container } = render(
				<TestWrapper>
					<FormImage name='avatar' />
				</TestWrapper>,
			)

			const dropZone = screen.getByLabelText('Upload image (click or drag and drop)')
			const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

			const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})

			fireEvent.keyDown(dropZone, { key: 'Escape' })
			expect(clickSpy).not.toHaveBeenCalled()

			clickSpy.mockRestore()
		})
	})

	it('does not trigger file dialog when disabled', () => {
		const { container } = render(
			<TestWrapper>
				<FormImage name='avatar' disabled />
			</TestWrapper>,
		)

		const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
		const dropZone = screen.getByLabelText('Image upload disabled')

		const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {})
		fireEvent.click(dropZone)

		expect(clickSpy).not.toHaveBeenCalled()
		clickSpy.mockRestore()
	})
})
