import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Hoist mocks for next/navigation
const { mockUseSearchParams, mockUseRouter } = vi.hoisted(() => {
	const mockUseSearchParams = vi.fn()
	const mockUseRouter = vi.fn().mockReturnValue({
		push: vi.fn(),
		replace: vi.fn(),
	})
	return { mockUseSearchParams, mockUseRouter }
})

vi.mock('next/navigation', () => ({
	useSearchParams: mockUseSearchParams,
	useRouter: mockUseRouter,
}))

// Hoist mock for newVerification
const { newVerification } = vi.hoisted(() => {
	const newVerification = vi.fn()
	return { newVerification }
})

vi.mock('@/actions/new-verification', () => ({
	newVerification,
}))

// Mock the UI components (simplified for testing)
vi.mock('@/components/ui', () => ({
	Card: ({ children, className }: any) => <div className={className}>{children}</div>,
	CardContent: ({ children }: any) => <div>{children}</div>,
	CardDescription: ({ children }: any) => <p>{children}</p>,
	CardFooter: ({ children }: any) => <footer>{children}</footer>,
	CardHeader: ({ children }: any) => <header>{children}</header>,
	CardTitle: ({ children }: any) => <h1>{children}</h1>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
	LoaderIcon: () => <div data-testid='loader-icon' />,
	TriangleAlertIcon: () => <div data-testid='alert-icon' />,
}))

// Import the component after mocks
import { NewVerificationForm } from '@/components/shared/modals/auth-modal/forms/new-verification-form'

describe('NewVerificationForm', () => {
	// Common setup before each test
	beforeEach(() => {
		vi.clearAllMocks()
		const defaultSearchParams = new URLSearchParams('token=valid-token')
		mockUseSearchParams.mockReturnValue(defaultSearchParams)
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('renders the verification form with title and description', () => {
		render(<NewVerificationForm />)

		expect(screen.getByText('Email Verification')).toBeInTheDocument()
		expect(screen.getByText('Confirming your verification')).toBeInTheDocument()
	})

	it('auto-submits on mount with valid token and shows success message', async () => {
		// Mock the newVerification function to return success
		newVerification.mockResolvedValue({ success: 'Email verified successfully' })

		render(<NewVerificationForm />)

		await waitFor(() => {
			expect(newVerification).toHaveBeenCalledWith('valid-token')
		})

		expect(screen.getByText('Email verified successfully')).toBeInTheDocument()
		expect(screen.getByText('Please Login')).toBeInTheDocument()
	})

	it('shows error message on verification failure', async () => {
		// Mock the newVerification function to return an error
		newVerification.mockResolvedValue({ error: 'Invalid token' })

		render(<NewVerificationForm />)

		await waitFor(() => {
			expect(screen.getByText('Invalid token')).toBeInTheDocument()
		})

		expect(screen.getByText('Please Login again')).toBeInTheDocument()
	})

	it('shows error when token is missing', async () => {
		// Mock useSearchParams to return no token
		const emptyParams = new URLSearchParams()
		mockUseSearchParams.mockReturnValue(emptyParams)

		render(<NewVerificationForm />)

		await waitFor(() => {
			expect(screen.getByText('Missing token!')).toBeInTheDocument()
		})

		expect(newVerification).not.toHaveBeenCalled()
		expect(screen.getByText('Please Login again')).toBeInTheDocument()
	})

	it('shows loading state on submit', async () => {
		let resolveFn: (value: unknown) => void = () => {}

		const pendingPromise = new Promise((resolve) => {
			resolveFn = resolve as () => void
		})
		newVerification.mockReturnValue(pendingPromise)

		render(<NewVerificationForm />)

		await waitFor(() => {
			expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
		})

		// Resolve the promise to complete the submission
		resolveFn({ success: 'Email verified' })
		await waitFor(() => {
			expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument()
		})
	})

	it('handles unexpected error with generic error message', async () => {
		// Mock the newVerification function to reject with an error
		newVerification.mockRejectedValue(new Error('Unexpected error'))

		render(<NewVerificationForm />)

		await waitFor(() => {
			expect(screen.getByText('An error occurred during verification')).toBeInTheDocument()
		})

		expect(screen.getByText('Please Login again')).toBeInTheDocument()
	})
})
