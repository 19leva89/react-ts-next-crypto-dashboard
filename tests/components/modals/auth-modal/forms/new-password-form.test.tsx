import { useSearchParams } from 'next/navigation'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { newPassword } from '@/actions/new-password'

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useSearchParams: vi.fn(),
}))

// Mock sonner (though not used directly, for consistency)
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}))

// Mock the newPassword action
vi.mock('@/actions/new-password', () => ({
	newPassword: vi.fn(),
}))

// Mock the resolver to validate password and confirm according to rules
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(() => async (values: any) => {
		const errors: Record<string, { message: string }> = {}

		// Password validation
		if (values.password) {
			const messages: string[] = []

			if (values.password.length < 8) {
				messages.push('Password must be at least 8 characters long')
			}
			if (!/[A-Z]/.test(values.password)) {
				messages.push('Password must contain at least one uppercase letter')
			}
			if (!/[a-z]/.test(values.password)) {
				messages.push('Password must contain at least one lowercase letter')
			}
			if (!/\d/.test(values.password)) {
				messages.push('Password must contain at least one digit')
			}

			if (messages.length > 0) {
				errors.password = { message: messages.join('; ') }
			}
		}

		// Confirm password validation
		if (values.confirmPassword && values.confirmPassword !== values.password) {
			errors.confirmPassword = { message: 'Passwords do not match' }
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
	Button: ({ children, onClick, variant, size, type, loading, className }: any) => (
		<button
			onClick={onClick}
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

// Mock lucide-react icon
vi.mock('lucide-react', () => ({
	TriangleAlertIcon: () => <div data-testid='alert-icon' />,
}))

// Do not mock react-hook-form, use real

// Import the component after mocks
import { NewPasswordForm } from '@/components/shared/modals/auth-modal/forms/new-password-form'

// Mock useFormContext for FormInput
import { useFormContext } from 'react-hook-form'

// Mock userEvent setup
const user = userEvent.setup()

describe('NewPasswordForm', () => {
	// Common setup before each test
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(useSearchParams).mockReturnValue({
			get: vi.fn().mockReturnValue('valid-token'),
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders the new password form with password and confirm password fields', () => {
		render(<NewPasswordForm />)

		expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument()
	})

	it('submits new password form with valid data and shows success message', async () => {
		// Mock the newPassword function to return success
		vi.mocked(newPassword).mockResolvedValue({ success: 'Password reset successfully' })

		render(<NewPasswordForm />)

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(newPassword).toHaveBeenCalledWith(
				{
					password: 'Password123',
					confirmPassword: 'Password123',
				},
				'valid-token',
			)
		})

		expect(screen.getByText('Password reset successfully')).toBeInTheDocument()
	})

	it('shows error message on new password failure', async () => {
		// Mock the newPassword function to return an error
		vi.mocked(newPassword).mockResolvedValue({ error: 'Invalid token' })

		render(<NewPasswordForm />)

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByText('Invalid token')).toBeInTheDocument()
		})
	})

	it('shows error when token is missing', async () => {
		// Mock useSearchParams to return no token
		vi.mocked(useSearchParams).mockReturnValue({
			get: vi.fn().mockReturnValue(null),
		} as any)

		render(<NewPasswordForm />)

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByText('Missing token!')).toBeInTheDocument()
		})

		expect(newPassword).not.toHaveBeenCalled()
	})

	it('shows loading state on submit', async () => {
		let resolveFn: (value?: unknown) => void = () => {}

		const pendingPromise = new Promise<{ success: string; error?: undefined }>((resolve) => {
			resolveFn = () => resolve({ success: 'Password updated' })
		}) as Promise<{ error: string; success?: undefined } | { success: string; error?: undefined }>
		vi.mocked(newPassword).mockReturnValue(pendingPromise)

		render(<NewPasswordForm />)

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		const submitButton = screen.getByRole('button', { name: /reset password/i })
		user.click(submitButton) // No await here to check state while pending

		await waitFor(() => {
			expect(submitButton).toBeDisabled()
		})

		// Resolve the promise to complete the submission
		resolveFn()
		await waitFor(() => {
			expect(submitButton).not.toBeDisabled()
		})
	})

	it('handles unexpected error with generic error message', async () => {
		// Mock the newPassword function to reject with an error
		vi.mocked(newPassword).mockRejectedValue(new Error('Unexpected error'))

		render(<NewPasswordForm />)

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByText('An error occurred during verification')).toBeInTheDocument()
		})
	})

	it('shows password validation error for short password', async () => {
		render(<NewPasswordForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /reset password/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Password'), 'short')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'short')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long',
			)
		})

		expect(newPassword).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing uppercase letter', async () => {
		render(<NewPasswordForm />)

		// Disable native HTML5 validation
		const submitButton = screen.getByRole('button', { name: /reset password/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Password'), 'password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one uppercase letter',
			)
		})

		expect(newPassword).not.toHaveBeenCalled()
	})

	it('shows confirm password validation error when passwords do not match', async () => {
		render(<NewPasswordForm />)

		// Disable native HTML5 validation
		const submitButton = screen.getByRole('button', { name: /reset password/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Different123')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByTestId('confirmPassword-error')).toHaveTextContent('Passwords do not match')
		})

		expect(newPassword).not.toHaveBeenCalled()
	})

	it('shows multiple password validation errors when multiple rules fail', async () => {
		render(<NewPasswordForm />)

		// Disable native HTML5 validation
		const submitButton = screen.getByRole('button', { name: /reset password/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Password'), 'A')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'A')
		await user.click(screen.getByRole('button', { name: /reset password/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long; Password must contain at least one lowercase letter; Password must contain at least one digit',
			)
		})

		expect(newPassword).not.toHaveBeenCalled()
	})
})
