'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ComponentProps, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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

interface Props extends ComponentProps<typeof Sidebar> {
	firstSection: MenuItem[]
	secondSection: MenuItem[]
}

export const SidebarApp = ({ firstSection, secondSection, ...props }: Props) => {
	const trpc = useTRPC()
	const currentPath = usePathname()
	const addLogoutNotificationMutation = useMutation(
		trpc.notifications.addLogoutNotification.mutationOptions(),
	)

	const { open } = useSidebar()
	const { data: session, status } = useSession()

	const [openAuthModal, setOpenAuthModal] = useState<boolean>(false)

	const renderMenuItems = (items: MenuItem[]) => {
		return items.map((item) => {
			const Icon = iconMap[item.icon]

			const isActive = currentPath
				? currentPath === item.url || (item.url !== '/' && currentPath.startsWith(item.url + '/'))
				: false

			return (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton className='text-lg' asChild isActive={isActive}>
						<Link href={item.url} className='flex h-12 items-center gap-4'>
							<Icon className={open ? 'size-5!' : 'size-4'} />

							<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			)
		})
	}

	const handleLogout = async () => {
		try {
			await addLogoutNotificationMutation.mutateAsync()

			await signOut({ callbackUrl: '/' })
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
										{status === 'loading' ? (
											<Skeleton className='size-10 rounded-full' />
										) : (
											<Avatar>
												<AvatarImage
													src={session?.user.image || '/svg/profile-image.svg'}
													alt={session?.user.name || 'User'}
													className='object-contain'
												/>
											</Avatar>
										)}

										<div className='flex flex-col gap-1 text-xs'>
											{status === 'loading' ? (
												<>
													<Skeleton className='h-4 w-32' />
													<Skeleton className='h-4 w-32' />
												</>
											) : (
												<>
													<span className='font-medium'>{session?.user.name || 'Guest'}</span>
													<span className='text-gray-500'>{session?.user.email || 'Please login'}</span>
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
								{!session?.user ? (
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
											<Link href='/settings' className='flex w-full items-center gap-2 rounded-xl p-3'>
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
