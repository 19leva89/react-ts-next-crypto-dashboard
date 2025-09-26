/* eslint-disable @next/next/no-img-element */

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { cloneElement, isValidElement, ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { credentialsLoginUser, loginUser } from '@/actions/login'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}))

// Mock the login actions
vi.mock('@/actions/login', () => ({
	credentialsLoginUser: vi.fn(),
	loginUser: vi.fn(),
}))

// Mock the resolver to validate email and password according to rules
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(() => async (values: any) => {
		const errors: Record<string, { message: string }> = {}

		// Email validation
		if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			errors.email = { message: 'Please enter a valid email address' }
		}

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
	FormCheckbox: ({
		name,
		label,
		className,
		required,
	}: {
		name: string
		label: string
		className?: string
		required?: boolean
	}) => {
		const { register, watch } = useFormContext()
		const checked = !!watch(name)
		return (
			<label data-testid={name} className={className}>
				<input
					type='checkbox'
					{...register(name)}
					checked={checked}
					required={required}
					data-testid={`${name}-input`}
				/>
				{label}
			</label>
		)
	},
}))

// Mock the UI components (simplified for testing)
vi.mock('@/components/ui', () => ({
	Button: ({ children, asChild, onClick, variant, size, type, loading, className }: any) => {
		if (asChild && isValidElement(children)) {
			return cloneElement(children as ReactElement<any>, {
				onClick,
				'data-variant': variant,
				'data-size': size,
				type,
				disabled: loading,
				className,
			})
		}
		return (
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
		)
	},
	Card: ({ children, className }: any) => <div className={className}>{children}</div>,
	CardContent: ({ children }: any) => <div>{children}</div>,
	CardDescription: ({ children }: any) => <p>{children}</p>,
	CardFooter: ({ children }: any) => <footer>{children}</footer>,
	CardHeader: ({ children }: any) => <header>{children}</header>,
	CardTitle: ({ children }: any) => <h1>{children}</h1>,
	Separator: ({ children, className }: any) => (
		<div className={className}>
			<hr />
			{children}
		</div>
	),
}))

// Mock Link and Image
vi.mock('next/link', () => ({
	default: ({ children, href, ...props }: any) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}))

vi.mock('next/image', () => ({
	default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}))

// Do not mock react-hook-form, use real

// Mock DEFAULT_LOGIN_REDIRECT
vi.mock('@/routes', () => ({
	DEFAULT_LOGIN_REDIRECT: '/coins',
}))

// Import the component after mocks
import { LoginForm } from '@/components/shared/modals/auth-modal/forms/login-form'

// Mock userEvent setup
const user = userEvent.setup()

describe('LoginForm', () => {
	// Common setup before each test
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(useRouter).mockReturnValue({
			push: vi.fn(),
			refresh: vi.fn(),
		} as any)
		vi.mocked(useSession).mockReturnValue({
			update: vi.fn(),
		} as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders the login form with email, password, and remember me fields', () => {
		render(<LoginForm />)

		expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
		expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
	})

	it('renders GitHub and Google provider buttons', () => {
		render(<LoginForm />)

		expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
	})

	it('renders forgot password link', () => {
		render(<LoginForm />)

		expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/auth/reset')
	})

	it('submits credentials login form with valid data and shows success toast', async () => {
		// Mock the credentialsLoginUser function to return success
		vi.mocked(credentialsLoginUser).mockResolvedValue({ success: true })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(credentialsLoginUser).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'Password123',
				rememberMe: false,
			})
		})

		expect(toast.success).toHaveBeenCalledWith('You have successfully login')
	})

	it('shows error toast on login failure', async () => {
		// Mock the credentialsLoginUser function to return an error
		vi.mocked(credentialsLoginUser).mockResolvedValue({ error: 'Invalid credentials' })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
		})
	})

	it('shows 2FA field and confirm button after twoFactor response', async () => {
		// Mock the credentialsLoginUser function to first return twoFactor, then success
		vi.mocked(credentialsLoginUser)
			.mockResolvedValueOnce({ twoFactor: true })
			.mockResolvedValueOnce({ success: true })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith('Please verify your email first. We sent you a new 2FA code')
			expect(screen.getByPlaceholderText('2FA code')).toBeInTheDocument()
			expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
		})

		// Simulate entering 2FA code and submitting
		await user.type(screen.getByPlaceholderText('2FA code'), '123456')
		await user.click(screen.getByRole('button', { name: /confirm/i }))

		await waitFor(() => {
			expect(credentialsLoginUser).toHaveBeenCalledWith(
				expect.objectContaining({
					code: '123456',
				}),
			)
		})
	})

	it('handles provider login for GitHub', async () => {
		// Mock the loginUser function to resolve successfully
		vi.mocked(loginUser).mockResolvedValue(undefined)

		render(<LoginForm />)

		await user.click(screen.getByRole('button', { name: /github/i }))

		await waitFor(() => {
			expect(loginUser).toHaveBeenCalledWith('github')
		})
	})

	it('handles provider login for Google', async () => {
		// Mock the loginUser function to resolve successfully
		vi.mocked(loginUser).mockResolvedValue(undefined)

		render(<LoginForm />)

		await user.click(screen.getByRole('button', { name: /google/i }))

		await waitFor(() => {
			expect(loginUser).toHaveBeenCalledWith('google')
		})
	})

	it('shows loading state on submit', async () => {
		let resolveFn: (value: { success: boolean }) => void = () => {}

		const pendingPromise = new Promise<{ success: boolean }>((resolve) => {
			resolveFn = resolve
		})
		vi.mocked(credentialsLoginUser).mockReturnValue(pendingPromise)

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		const submitButton = screen.getByRole('button', { name: /login/i })
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

	it('toggles remember me checkbox', async () => {
		render(<LoginForm />)

		const checkbox = screen.getByTestId('rememberMe-input')
		await user.click(checkbox)

		expect(checkbox).toBeChecked()
	})

	it('submits credentials login form with rememberMe true', async () => {
		// Mock the credentialsLoginUser function to return success
		vi.mocked(credentialsLoginUser).mockResolvedValue({ success: true })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByTestId('rememberMe-input'))

		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(credentialsLoginUser).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'Password123',
				rememberMe: true,
			})
		})
	})

	it('calls onClose on successful login', async () => {
		// Mock onClose callback
		const mockOnClose = vi.fn()
		// Mock the credentialsLoginUser function to return success
		vi.mocked(credentialsLoginUser).mockResolvedValue({ success: true })

		render(<LoginForm onClose={mockOnClose} />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled()
		})
	})

	it('navigates to default redirect and refreshes on success', async () => {
		// Mock router functions
		const mockPush = vi.fn()
		const mockRefresh = vi.fn()
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
			refresh: mockRefresh,
		} as any)
		// Mock the credentialsLoginUser function to return success
		vi.mocked(credentialsLoginUser).mockResolvedValue({ success: true })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/coins')
			expect(mockRefresh).toHaveBeenCalled()
		})
	})

	it('updates session on successful login', async () => {
		// Mock session update function
		const mockUpdate = vi.fn()
		vi.mocked(useSession).mockReturnValue({
			update: mockUpdate,
		} as any)
		// Mock the credentialsLoginUser function to return success
		vi.mocked(credentialsLoginUser).mockResolvedValue({ success: true })

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(mockUpdate).toHaveBeenCalled()
		})
	})

	it('handles unexpected error with generic toast', async () => {
		// Mock the credentialsLoginUser function to reject with an error
		vi.mocked(credentialsLoginUser).mockRejectedValue(new Error('Unexpected error'))

		render(<LoginForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again')
		})
	})

	it('shows password validation error for short password', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'short')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long',
			)
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing uppercase letter', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one uppercase letter',
			)
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing lowercase letter', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'PASSWORD123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one lowercase letter',
			)
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing digit', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one digit',
			)
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})

	it('shows multiple password validation errors when multiple rules fail', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'A')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long; Password must contain at least one lowercase letter; Password must contain at least one digit',
			)
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})

	it('shows email validation error for invalid email', async () => {
		render(<LoginForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /login/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'invalid')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /login/i }))

		await waitFor(() => {
			expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address')
		})

		expect(credentialsLoginUser).not.toHaveBeenCalled()
	})
})
