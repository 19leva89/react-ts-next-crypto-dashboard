import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { resetPassword } from '@/actions/reset-password'

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
	useSession: vi.fn(() => ({
		update: vi.fn(),
	})),
}))

// Mock the resetPassword action
vi.mock('@/actions/reset-password', () => ({
	resetPassword: vi.fn(),
}))

// Mock the resolver to validate email according to rules
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(() => async (values: any) => {
		const errors: Record<string, { message: string }> = {}

		// Email validation
		if (!values.email) {
			errors.email = { message: 'Email is required' }
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			errors.email = { message: 'Please enter a valid email address' }
		}

		if (Object.keys(errors).length === 0) {
			return { values, errors: {} }
		}

		return { values, errors }
	}),
}))

// Mock the form components to use react-hook-form register (controlled for reliable testing) and display errors
vi.mock('@/components/shared/form', () => ({
	FormInput: ({
		name,
		type,
		placeholder,
		required,
	}: {
		name: string
		type: string
		placeholder: string
		required?: boolean
	}) => {
		const { register, watch, formState } = useFormContext()
		const value = watch(name) ?? ''
		const error = formState.errors[name]
		return (
			<div>
				<input
					{...register(name, { required })}
					value={value}
					type={type}
					placeholder={placeholder}
					data-testid={name}
				/>
				{error && (
					<p data-testid={`${name}-error`} role='alert'>
						{error.message?.toString()}
					</p>
				)}
			</div>
		)
	},
}))

// Mock the UI components (simplified for testing)
vi.mock('@/components/ui', () => ({
	Button: ({ children, variant, size, type, loading, className }: any) => (
		<button
			data-variant={variant}
			data-size={size}
			type={type}
			disabled={loading}
			data-testid='button'
			className={className}
		>
			{children}
		</button>
	),
	Card: ({ children, className }: any) => <div className={className}>{children}</div>,
	CardContent: ({ children }: any) => <div>{children}</div>,
	CardDescription: ({ children }: any) => <p>{children}</p>,
	CardFooter: ({ children }: any) => <footer>{children}</footer>,
	CardHeader: ({ children }: any) => <header>{children}</header>,
	CardTitle: ({ children }: any) => <h1>{children}</h1>,
}))

// Import the component after mocks
import { ResetForm } from '@/components/shared/modals/auth-modal/forms/reset-form'

// Mock userEvent setup
const user = userEvent.setup()

describe('ResetForm', () => {
	// Common setup before each test
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})

		// Mock router
		vi.mocked(useRouter).mockReturnValue({
			push: vi.fn(),
		} as any)

		// Mock useSession
		vi.mocked(useSession).mockReturnValue({
			update: vi.fn(),
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders the reset form with email field and submit button', () => {
		render(<ResetForm />)

		expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument()
		expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
		expect(screen.getByText('Enter your email to reset your password')).toBeInTheDocument()
	})

	it('submits reset form with valid data and shows success toast', async () => {
		// Mock the resetPassword function to return success
		vi.mocked(resetPassword).mockResolvedValue({ success: 'Reset email sent!' })

		render(<ResetForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.click(screen.getByRole('button', { name: /send reset email/i }))

		await waitFor(() => {
			expect(resetPassword).toHaveBeenCalledWith({
				email: 'test@example.com',
			})
		})

		expect(toast.success).toHaveBeenCalledWith(
			'Please verify your email. We sent you a link to reset password',
		)
		expect(vi.mocked(useSession).mock.results[0].value.update).toHaveBeenCalled()
		expect(vi.mocked(useRouter).mock.results[0].value.push).toHaveBeenCalledWith('/')
	})

	it('shows error toast when resetPassword returns an error', async () => {
		// Mock the resetPassword function to return an error
		vi.mocked(resetPassword).mockResolvedValue({ error: 'Email not found' })

		render(<ResetForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.click(screen.getByRole('button', { name: /send reset email/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Email not found')
		})

		expect(resetPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
		})
	})

	it('shows generic error toast on unexpected error', async () => {
		// Mock the resetPassword function to throw an error
		vi.mocked(resetPassword).mockRejectedValue(new Error('Unexpected error'))

		render(<ResetForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.click(screen.getByRole('button', { name: /send reset email/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again')
		})

		expect(resetPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
		})
	})

	it('shows loading state on submit', async () => {
		let resolveFn: (value?: { error?: string; success?: boolean } | undefined) => void = () => {}

		const pendingPromise = new Promise<
			{ error: string; success?: undefined } | { success: string; error?: undefined }
		>((resolve) => {
			resolveFn = resolve as any
		})
		vi.mocked(resetPassword).mockReturnValue(pendingPromise)

		render(<ResetForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		const submitButton = screen.getByRole('button', { name: /send reset email/i })
		user.click(submitButton) // No await here to check state while pending

		await waitFor(() => {
			expect(submitButton).toBeDisabled()
		})

		// Resolve the promise to complete the submission
		resolveFn({ success: true })
		await waitFor(() => {
			expect(submitButton).not.toBeDisabled()
		})
	})

	it('calls onClose on successful reset', async () => {
		// Mock onClose callback
		const mockOnClose = vi.fn()
		// Mock the resetPassword function to return success
		vi.mocked(resetPassword).mockResolvedValue({ success: 'Reset email sent!' })

		render(<ResetForm onClose={mockOnClose} />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.click(screen.getByRole('button', { name: /send reset email/i }))

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled()
		})
	})

	it('shows email validation error for missing email', async () => {
		render(<ResetForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /send reset email/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required')
		})

		expect(resetPassword).not.toHaveBeenCalled()
	})

	it('shows email validation error for invalid email', async () => {
		render(<ResetForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /send reset email/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'invalid')
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address')
		})

		expect(resetPassword).not.toHaveBeenCalled()
	})
})
