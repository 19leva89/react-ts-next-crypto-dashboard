'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react'

import {
	Avatar,
	AvatarImage,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	Skeleton,
	useSidebar,
} from '@/components/ui'
import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { Logo } from '@/components/shared'
import { iconMap, MenuItem } from '@/constants/menu'
import { AuthModal } from '@/components/shared/modals/auth-modal'

interface Props {
	firstSection: MenuItem[]
	secondSection: MenuItem[]
}

export const SidebarApp = ({ firstSection, secondSection, ...props }: Props) => {
	const trpc = useTRPC()
	const currentPath = usePathname()

	const { data: session, status } = useSession()
	const { open, isMobile, setOpenMobile } = useSidebar()

	const [openAuthModal, setOpenAuthModal] = useState<boolean>(false)

	const user = session?.user
	const isLoading = status === 'loading'

	const addLogoutNotificationMutation = useMutation(
		trpc.notifications.addLogoutNotification.mutationOptions(),
	)

	const { data: unreadPriceNotifications } = useQuery({
		...trpc.notifications.getUnreadPriceNotifications.queryOptions(),
		enabled: !!user,
	})

	const handleLinkClick = () => {
		if (isMobile) {
			setOpenMobile(false)
		}
	}

	const renderMenuItems = (items: MenuItem[]) => {
		return items.map((item) => {
			const Icon = iconMap[item.icon]

			const hasUnread =
				item.url === '/notifications' &&
				Array.isArray(unreadPriceNotifications) &&
				unreadPriceNotifications.length > 0

			const isActive =
				currentPath === item.url || (item.url !== '/' && currentPath.startsWith(`${item.url}/`))

			return (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className='rounded-xl text-lg'>
						<Link href={item.url} className='flex h-12 items-center gap-4' onClick={handleLinkClick}>
							<div className='relative'>
								<Icon className={open ? 'size-5!' : 'size-4'} />

								{!isMobile && !open && hasUnread && (
									<span className='absolute -top-1 -right-1 size-1.5 rounded-full bg-red-500' />
								)}
							</div>

							<span className='relative flex-1'>
								{item.title}

								{(isMobile || open) && hasUnread && (
									<span className='absolute top-1 right-1 size-2 rounded-full bg-red-500' />
								)}
							</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			)
		})
	}

	const handleLogout = async () => {
		handleLinkClick()

		try {
			await signOut({ callbackUrl: '/' })

			try {
				await addLogoutNotificationMutation.mutateAsync()
			} catch (error) {
				console.error('Failed to send logout notification:', error)
			}
		} catch (error) {
			console.error('Error during logout:', error)
		}
	}

	return (
		<Sidebar side='left' variant='sidebar' collapsible='icon' className='z-50' {...props}>
			<SidebarHeader>
				<div className='flex items-center justify-center px-4 pt-1'>
					<Link href='/'>
						<Logo />
					</Link>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>{renderMenuItems(firstSection)}</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<div className='px-4 py-0'>
					<SidebarSeparator className='mx-0' />
				</div>

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>{renderMenuItems(secondSection)}</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className='mx-2 p-0'>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									variant='outline'
									size='lg'
									className={cn(
										'group mb-4 cursor-pointer justify-between gap-3',
										open ? 'rounded-xl' : 'rounded-full',
									)}
								>
									<div className='flex grow items-center justify-between gap-2'>
										{isLoading ? (
											<Skeleton className='size-10 rounded-full' />
										) : (
											<Avatar>
												<AvatarImage
													src={user?.image || '/svg/profile-image.svg'}
													alt={user?.name || 'User'}
													className='object-contain'
												/>
											</Avatar>
										)}

										<div className='flex flex-col gap-1 text-xs'>
											{isLoading ? (
												<>
													<Skeleton className='h-4 w-32' />
													<Skeleton className='h-4 w-32' />
												</>
											) : (
												<>
													<span className='font-medium'>{user?.name || 'Guest'}</span>
													<span className='text-gray-500'>{user?.email || 'Please login'}</span>
												</>
											)}
										</div>

										<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
											<ChevronDownIcon size={16} className='absolute inset-0 m-auto' />
										</div>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align='start'
								className='z-100 flex w-(--radix-popper-anchor-width) flex-col gap-1 rounded-xl bg-white shadow-lg dark:bg-gray-900'
							>
								{!user ? (
									<DropdownMenuItem className='h-10 w-full cursor-pointer' asChild>
										<button
											onClick={() => {
												setOpenAuthModal(true)
											}}
											className='flex w-full items-center gap-2 rounded-xl p-3'
										>
											<UserIcon size={16} />
											Login
										</button>
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem className='h-10 w-full cursor-pointer' asChild>
											<Link
												href='/settings'
												onClick={handleLinkClick}
												className='flex w-full items-center gap-2 rounded-xl p-3'
											>
												<SettingsIcon size={16} />
												Settings
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem className='h-10 w-full cursor-pointer' asChild>
											<button
												onClick={handleLogout}
												className='flex w-full items-center gap-2 rounded-xl p-3'
											>
												<LogOutIcon size={16} />
												Logout
											</button>
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>

							<AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
