import { toast } from 'sonner'
import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { cloneElement, isValidElement, ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { registerUser } from '@/actions/register'

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}))

// Mock the register action
vi.mock('@/actions/register', () => ({
	registerUser: vi.fn(),
}))

// Mock the resolver to validate email, name, password, and confirmPassword according to rules
vi.mock('@hookform/resolvers/zod', () => ({
	zodResolver: vi.fn(() => async (values: any) => {
		const errors: Record<string, { message: string }> = {}

		// Name validation
		if (!values.name) {
			errors.name = { message: 'Name is required' }
		}

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
}))

// Import the component after mocks
import { RegisterForm } from '@/components/shared/modals/auth-modal/forms/register-form'

// Mock userEvent setup
const user = userEvent.setup()

describe('RegisterForm', () => {
	// Common setup before each test
	beforeEach(() => {
		vi.clearAllMocks()
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders the register form with email, name, password, and confirm password fields', () => {
		render(<RegisterForm />)

		expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument()
	})

	it('submits register form with valid data and shows success toast', async () => {
		// Mock the registerUser function to resolve successfully
		vi.mocked(registerUser).mockResolvedValue(undefined)

		render(<RegisterForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(registerUser).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'Password123',
				name: 'John Doe',
				confirmPassword: 'Password123',
			})
		})

		expect(toast.success).toHaveBeenCalledWith('Registration successful 📝. Confirm your email')
	})

	it('shows error toast on register failure', async () => {
		// Mock the registerUser function to reject with an error
		vi.mocked(registerUser).mockRejectedValue(new Error('Registration failed'))

		render(<RegisterForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Registration failed')
		})
	})

	it('shows loading state on submit', async () => {
		let resolveFn: (value?: { error: string } | undefined) => void = () => {}

		const pendingPromise = new Promise<{ error: string } | undefined>((resolve) => {
			resolveFn = resolve
		})
		vi.mocked(registerUser).mockReturnValue(pendingPromise)

		render(<RegisterForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		const submitButton = screen.getByRole('button', { name: /register/i })
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

	it('calls onClose on successful register', async () => {
		// Mock onClose callback
		const mockOnClose = vi.fn()
		// Mock the registerUser function to resolve successfully
		vi.mocked(registerUser).mockResolvedValue(undefined)

		render(<RegisterForm onClose={mockOnClose} />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled()
		})
	})

	it('shows unexpected error message on register failure', async () => {
		// Mock the registerUser function to reject with an error
		vi.mocked(registerUser).mockRejectedValue(new Error('Unexpected error'))

		render(<RegisterForm />)

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith('Unexpected error')
		})
	})

	it('shows name validation error for missing name', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required')
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for short password', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'short')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'short')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long',
			)
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing uppercase letter', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one uppercase letter',
			)
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing lowercase letter', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'PASSWORD123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'PASSWORD123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one lowercase letter',
			)
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows password validation error for missing digit', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must contain at least one digit',
			)
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows confirm password validation error when passwords do not match', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Different123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('confirmPassword-error')).toHaveTextContent('Passwords do not match')
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows multiple password validation errors when multiple rules fail', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'A')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'A')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('password-error')).toHaveTextContent(
				'Password must be at least 8 characters long; Password must contain at least one lowercase letter; Password must contain at least one digit',
			)
		})

		expect(registerUser).not.toHaveBeenCalled()
	})

	it('shows email validation error for invalid email', async () => {
		render(<RegisterForm />)

		// Disable native HTML5 validation to allow form submission and trigger RHF resolver
		const submitButton = screen.getByRole('button', { name: /register/i })
		const form = submitButton.closest('form')
		if (form) {
			form.setAttribute('novalidate', 'novalidate')
		}

		await user.type(screen.getByPlaceholderText('Email'), 'invalid')
		await user.type(screen.getByPlaceholderText('Full name'), 'John Doe')
		await user.type(screen.getByPlaceholderText('Password'), 'Password123')
		await user.type(screen.getByPlaceholderText('Repeat password'), 'Password123')
		await user.click(screen.getByRole('button', { name: /register/i }))

		await waitFor(() => {
			expect(screen.getByTestId('email-error')).toHaveTextContent('Please enter a valid email address')
		})

		expect(registerUser).not.toHaveBeenCalled()
	})
})
