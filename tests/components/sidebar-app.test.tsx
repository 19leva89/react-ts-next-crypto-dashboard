/* eslint-disable @next/next/no-img-element */

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import type { MenuItem } from '@/constants/menu'
import { SidebarApp } from '@/components/shared/sidebar-app'

// Mock all external dependencies
vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
	signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({
	usePathname: vi.fn(),
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	})),
}))

vi.mock('@tanstack/react-query', () => ({
	useMutation: vi.fn(),
	useQuery: vi.fn(),
}))

vi.mock('@/components/ui', () => ({
	Avatar: ({ children }: { children: ReactNode }) => <div data-testid='avatar'>{children}</div>,
	AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
		<img src={src} alt={alt} data-testid='avatar-image' />
	),
	DropdownMenu: ({ children }: { children: ReactNode }) => <div data-testid='dropdown-menu'>{children}</div>,
	DropdownMenuContent: ({ children }: { children: ReactNode }) => (
		<div data-testid='dropdown-content'>{children}</div>
	),
	DropdownMenuItem: ({ children, asChild }: { children: ReactNode; asChild?: boolean }) =>
		asChild ? <>{children}</> : <div data-testid='dropdown-item'>{children}</div>,
	DropdownMenuTrigger: ({ children, asChild }: { children: ReactNode; asChild?: boolean }) =>
		asChild ? <>{children}</> : <div data-testid='dropdown-trigger'>{children}</div>,
	Sidebar: ({ children }: { children: ReactNode }) => <aside data-testid='sidebar'>{children}</aside>,
	SidebarContent: ({ children }: { children: ReactNode }) => (
		<div data-testid='sidebar-content'>{children}</div>
	),
	SidebarFooter: ({ children }: { children: ReactNode }) => (
		<footer data-testid='sidebar-footer'>{children}</footer>
	),
	SidebarGroup: ({ children }: { children: ReactNode }) => <div data-testid='sidebar-group'>{children}</div>,
	SidebarGroupContent: ({ children }: { children: ReactNode }) => (
		<div data-testid='sidebar-group-content'>{children}</div>
	),
	SidebarHeader: ({ children }: { children: ReactNode }) => (
		<header data-testid='sidebar-header'>{children}</header>
	),
	SidebarMenu: ({ children }: { children: ReactNode }) => <nav data-testid='sidebar-menu'>{children}</nav>,
	SidebarMenuButton: ({
		children,
		isActive,
		asChild,
		...props
	}: {
		children: ReactNode
		isActive?: boolean
		asChild?: boolean
		[key: string]: any
	}) =>
		asChild ? (
			<div data-active={isActive} data-testid='sidebar-menu-button-wrapper'>
				{children}
			</div>
		) : (
			<button data-testid='sidebar-menu-button' data-active={isActive} {...props}>
				{children}
			</button>
		),
	SidebarMenuItem: ({ children }: { children: ReactNode }) => (
		<div data-testid='sidebar-menu-item'>{children}</div>
	),
	SidebarSeparator: () => <hr data-testid='sidebar-separator' />,
	Skeleton: ({ className }: { className?: string }) => <div data-testid='skeleton' className={className} />,
	useSidebar: vi.fn(),
}))

vi.mock('@/lib', () => ({
	cn: (...classes: (string | undefined | boolean)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@/components/shared', () => ({
	Logo: () => <div data-testid='logo'>Logo</div>,
}))

vi.mock('@/components/shared/modals/auth-modal', () => ({
	AuthModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
		open ? (
			<div data-testid='auth-modal' onClick={onClose}>
				Auth Modal
			</div>
		) : null,
}))

vi.mock('@/constants/menu', () => ({
	iconMap: {
		home: () => <div data-testid='home-icon'>Home Icon</div>,
		settings: () => <div data-testid='settings-icon'>Settings Icon</div>,
		notifications: () => <div data-testid='notifications-icon'>Notifications Icon</div>,
		user: () => <div data-testid='user-icon'>User Icon</div>,
	},
}))

// Fix the Next.js Link mock to prevent navigation
vi.mock('next/link', () => ({
	default: ({
		href,
		children,
		onClick,
		...props
	}: {
		href: string
		children: ReactNode
		onClick?: () => void
		[key: string]: any
	}) => (
		<a
			href={href}
			onClick={(e) => {
				e.preventDefault() // Prevent actual navigation
				onClick?.()
			}}
			data-testid='link'
			{...props}
		>
			{children}
		</a>
	),
}))

vi.mock('@/trpc/client', () => ({
	useTRPC: () => ({
		notifications: {
			addLogoutNotification: {
				mutationOptions: () => ({}),
			},
			getUnreadPriceNotifications: {
				queryOptions: () => ({}),
			},
		},
	}),
}))

const mockUseSession = vi.mocked(useSession)
const mockUsePathname = vi.mocked(usePathname)
const mockUseMutation = vi.mocked(useMutation)
const mockUseQuery = vi.mocked(useQuery)
const mockSignOut = vi.mocked(signOut)

// Import UI components to access the mocked useSidebar
let mockUseSidebar: ReturnType<typeof vi.fn>

describe('SidebarApp', () => {
	const mockFirstSection: MenuItem[] = [
		{ title: 'Home', url: '/', icon: 'home', private: false },
		{ title: 'Settings', url: '/settings', icon: 'settings', private: true },
	]

	const mockSecondSection: MenuItem[] = [
		{ title: 'Notifications', url: '/notifications', icon: 'notifications', private: true },
		{ title: 'Profile', url: '/profile', icon: 'user', private: true },
	]

	const mockMutateAsync = vi.fn()
	const mockSetOpenMobile = vi.fn()

	beforeEach(async () => {
		vi.clearAllMocks()

		// Get the mocked useSidebar
		const uiModule = await vi.importMock<typeof import('@/components/ui')>('@/components/ui')
		mockUseSidebar = uiModule.useSidebar as ReturnType<typeof vi.fn>

		mockUsePathname.mockReturnValue('/')

		mockUseMutation.mockReturnValue({
			mutateAsync: mockMutateAsync,
			isPending: false,
			error: null,
			data: undefined,
		} as any)

		mockUseQuery.mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
		} as any)

		// Set the default return value for useSidebar
		mockUseSidebar.mockReturnValue({
			open: false,
			isMobile: false,
			setOpenMobile: mockSetOpenMobile,
			setOpen: vi.fn(),
			state: 'collapsed',
			openMobile: false,
			toggleSidebar: vi.fn(),
		})
	})

	// Add this to suppress navigation errors in tests
	beforeEach(() => {
		// Suppress the specific navigation error
		const consoleError = console.error
		vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
			if (typeof message === 'string' && message.includes('Not implemented: navigation')) {
				return
			}
			consoleError(message, ...args)
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Basic rendering', () => {
		it('renders sidebar with logo and menu sections', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByTestId('sidebar')).toBeInTheDocument()
			expect(screen.getByTestId('logo')).toBeInTheDocument()
			expect(screen.getAllByTestId('sidebar-menu')).toHaveLength(3) // 2 sections + footer menu
		})

		it('renders menu items from both sections', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByText('Home')).toBeInTheDocument()
			expect(screen.getByText('Settings')).toBeInTheDocument()
			expect(screen.getByText('Notifications')).toBeInTheDocument()
			expect(screen.getByText('Profile')).toBeInTheDocument()
		})

		it('renders icons for menu items', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByTestId('home-icon')).toBeInTheDocument()
			expect(screen.getByTestId('settings-icon')).toBeInTheDocument()
			expect(screen.getByTestId('notifications-icon')).toBeInTheDocument()
			expect(screen.getByTestId('user-icon')).toBeInTheDocument()
		})
	})

	describe('Authentication states', () => {
		it('shows guest user when not authenticated', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByText('Guest')).toBeInTheDocument()
			expect(screen.getByText('Please login')).toBeInTheDocument()
		})

		it('shows login button when not authenticated', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByText('Login')).toBeInTheDocument()
		})

		it('shows user info when authenticated', () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getByText('John Doe')).toBeInTheDocument()
			expect(screen.getByText('john@example.com')).toBeInTheDocument()
		})

		it('shows logout and settings options when authenticated', () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Look for Settings link in the dropdown menu (footer area)
			const dropdownContent = screen.getByTestId('dropdown-content')
			expect(dropdownContent).toBeInTheDocument()

			// Check that the dropdown contains settings and logout options
			const settingsInDropdown = dropdownContent.querySelector('a[href="/settings"]')
			expect(settingsInDropdown).toBeInTheDocument()
			expect(settingsInDropdown).toHaveTextContent('Settings')

			expect(screen.getByText('Logout')).toBeInTheDocument()
		})

		it('shows loading skeleton when session is loading', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'loading',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(screen.getAllByTestId('skeleton')).toHaveLength(3) // avatar + 2 text skeletons
		})
	})

	describe('Active menu items', () => {
		it('marks current path as active', () => {
			mockUsePathname.mockReturnValue('/settings')
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Look for the SidebarMenuButton wrapper that contains the Settings link
			const settingsWrapper = screen
				.getByText('Settings')
				.closest('[data-testid="sidebar-menu-button-wrapper"]')
			expect(settingsWrapper).toHaveAttribute('data-active', 'true')
		})

		it('marks nested paths as active', () => {
			mockUsePathname.mockReturnValue('/settings/profile')
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Look for the SidebarMenuButton wrapper that contains the Settings link
			const settingsWrapper = screen
				.getByText('Settings')
				.closest('[data-testid="sidebar-menu-button-wrapper"]')
			expect(settingsWrapper).toHaveAttribute('data-active', 'true')
		})

		it('does not mark root path as active for other paths', () => {
			mockUsePathname.mockReturnValue('/settings')
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Look for the SidebarMenuButton wrapper that contains the Home link
			const homeWrapper = screen.getByText('Home').closest('[data-testid="sidebar-menu-button-wrapper"]')
			expect(homeWrapper).toHaveAttribute('data-active', 'false')
		})
	})

	describe('Notifications', () => {
		it('shows notification indicator when there are unread notifications', () => {
			mockUseSession.mockReturnValue({
				data: { user: { name: 'John Doe', email: 'john@example.com' } },
				status: 'authenticated',
			} as any)

			mockUseQuery.mockReturnValue({
				data: [{ id: 1, message: 'Test notification' }],
				isLoading: false,
				error: null,
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Should show red notification dots
			expect(document.querySelector('.bg-red-500')).toBeInTheDocument()
		})

		it('does not show notification indicator when there are no unread notifications', () => {
			mockUseSession.mockReturnValue({
				data: { user: { name: 'John Doe', email: 'john@example.com' } },
				status: 'authenticated',
			} as any)

			mockUseQuery.mockReturnValue({
				data: [],
				isLoading: false,
				error: null,
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(document.querySelector('.bg-red-500')).not.toBeInTheDocument()
		})

		it('does not query notifications when user is not authenticated', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			expect(mockUseQuery).toHaveBeenCalledWith(
				expect.objectContaining({
					enabled: false,
				}),
			)
		})
	})

	describe('User interactions', () => {
		it('opens auth modal when login button is clicked', async () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const loginButton = screen.getByText('Login')
			fireEvent.click(loginButton)

			await waitFor(() => {
				expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
			})
		})

		it('closes auth modal when clicking on modal', async () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const loginButton = screen.getByText('Login')
			fireEvent.click(loginButton)

			const authModal = await screen.findByTestId('auth-modal')
			fireEvent.click(authModal)

			await waitFor(() => {
				expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
			})
		})

		it('handles logout when logout button is clicked', async () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			mockSignOut.mockResolvedValue(undefined as any)
			mockMutateAsync.mockResolvedValue(undefined)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const logoutButton = screen.getByText('Logout')
			fireEvent.click(logoutButton)

			await waitFor(() => {
				expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
			})

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalled()
			})
		})

		it('handles logout notification error gracefully', async () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			mockSignOut.mockResolvedValue(undefined as any)
			mockMutateAsync.mockRejectedValue(new Error('Network error'))

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const logoutButton = screen.getByText('Logout')
			fireEvent.click(logoutButton)

			await waitFor(() => {
				expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' })
			})

			await waitFor(() => {
				expect(consoleSpy).toHaveBeenCalledWith('Failed to send logout notification:', expect.any(Error))
			})

			consoleSpy.mockRestore()
		})
	})

	describe('Mobile behavior', () => {
		it('closes mobile sidebar when link is clicked', () => {
			mockUseSidebar.mockReturnValue({
				open: false,
				isMobile: true,
				setOpenMobile: mockSetOpenMobile,
				setOpen: vi.fn(),
				state: 'expanded',
				openMobile: false,
				toggleSidebar: vi.fn(),
			})

			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const homeLink = screen.getByText('Home').closest('a')
			fireEvent.click(homeLink!)

			expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
		})

		it('closes mobile sidebar when settings link is clicked', async () => {
			mockUseSidebar.mockReturnValue({
				open: false,
				isMobile: true,
				setOpenMobile: mockSetOpenMobile,
				setOpen: vi.fn(),
				state: 'expanded',
				openMobile: false,
				toggleSidebar: vi.fn(),
			})

			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			// Click on the Settings link in the dropdown menu
			const dropdownContent = screen.getByTestId('dropdown-content')
			const settingsLink = dropdownContent.querySelector('a[href="/settings"]')
			fireEvent.click(settingsLink!)

			expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
		})
	})

	describe('Avatar handling', () => {
		it('shows user avatar when user has image', () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: 'https://example.com/avatar.jpg',
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const avatarImage = screen.getByTestId('avatar-image')
			expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg')
			expect(avatarImage).toHaveAttribute('alt', 'John Doe')
		})

		it('shows default avatar when user has no image', () => {
			const mockUser = {
				name: 'John Doe',
				email: 'john@example.com',
				image: null,
			}

			mockUseSession.mockReturnValue({
				data: { user: mockUser },
				status: 'authenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const avatarImage = screen.getByTestId('avatar-image')
			expect(avatarImage).toHaveAttribute('src', '/svg/profile-image.svg')
			expect(avatarImage).toHaveAttribute('alt', 'John Doe')
		})

		it('shows default avatar for guest user', () => {
			mockUseSession.mockReturnValue({
				data: null,
				status: 'unauthenticated',
			} as any)

			render(<SidebarApp firstSection={mockFirstSection} secondSection={mockSecondSection} />)

			const avatarImage = screen.getByTestId('avatar-image')
			expect(avatarImage).toHaveAttribute('src', '/svg/profile-image.svg')
			expect(avatarImage).toHaveAttribute('alt', 'User')
		})
	})
})
