'use client'

import Link from 'next/link'
import {
	Activity,
	Bell,
	ChevronDown,
	Clipboard,
	CreditCard,
	FileText,
	HelpCircle,
	Home,
	LogOut,
	Newspaper,
	Settings,
	User,
	Wallet,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

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
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	Skeleton,
} from '@/components/ui'
import { Logo } from '@/components/shared'
import { useUserInfo } from '@/hooks/use-user-info'
import { AuthModal } from '@/components/shared/modals/auth-modal'

// Menu items
const sideBarData = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: Home,
	},
	{
		title: 'News',
		url: '/news',
		icon: Newspaper,
	},
	{
		title: 'Activities',
		url: '/protected/activities',
		icon: Activity,
	},
	{
		title: 'Cards',
		url: '/cards',
		icon: CreditCard,
	},
	{
		title: 'Reports',
		url: '/reports',
		icon: FileText,
	},
	{
		title: 'Notifications',
		url: '/notifications',
		icon: Bell,
	},
	{
		title: 'Billing',
		url: '/billing',
		icon: Wallet,
	},
	{
		title: 'Invoices',
		url: '/invoices',
		icon: Clipboard,
	},
	{
		title: 'Help center',
		url: '/help',
		icon: HelpCircle,
	},
	{
		title: 'Settings',
		url: '/settings',
		icon: Settings,
	},
]

export const SidebarApp = () => {
	const currentPath = usePathname()

	const { user, loading, error } = useUserInfo()

	const [openAuthModal, setOpenAuthModal] = useState(false)

	const onClickSignOut = useCallback(() => {
		signOut({
			callbackUrl: '/',
		})
	}, [])

	return (
		<Sidebar side="left" variant="sidebar" collapsible="icon" className="z-[100]">
			<SidebarHeader>
				<div className="flex px-4 pt-1">
					<Link href={sideBarData[0].url}>
						<Logo />
					</Link>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel className="text-base">Menu</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu>
							{sideBarData.map((item) => {
								const isActive = currentPath === item.url

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton className="text-lg" asChild isActive={isActive}>
											<a href={item.url} className="flex items-center gap-4 h-[48px]">
												<item.icon className="!w-5 !h-5" />

												<span>{item.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									variant="outline"
									size="lg"
									className="gap-3 justify-between mb-4 rounded-xl group"
								>
									<div className="grow flex items-center justify-between gap-2">
										{loading ? (
											<Skeleton className="w-10 h-10 rounded-full" /> // Skeleton с размером для аватара
										) : (
											<Avatar>
												<AvatarImage
													src={user?.image || '/svg/profile-image.svg'}
													alt={user?.name || 'User'}
													className="object-contain"
												/>
											</Avatar>
										)}

										<div className="flex flex-col gap-1 text-xs text-center">
											{loading ? (
												<>
													<Skeleton className="w-32 h-4" />
													<Skeleton className="w-32 h-4" />
												</>
											) : (
												<>
													<span className="font-medium">{user?.name || 'Guest'}</span>
													<span className="text-gray-500">{user?.email || 'Please login'}</span>
												</>
											)}
										</div>

										<ChevronDown
											size={16}
											className="transition-transform duration-300 group-hover:rotate-180"
										/>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align="start"
								className="z-[100] flex flex-col gap-2 w-[--radix-popper-anchor-width] rounded-xl shadow-lg bg-white dark:bg-dark"
							>
								<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
									{!user ? (
										<button
											onClick={() => {
												setOpenAuthModal(true)
											}}
											className="flex items-center gap-1 p-3 rounded-xl w-full duration-300"
										>
											<User size={16} />
											Login
										</button>
									) : (
										<button
											onClick={onClickSignOut}
											className="flex items-center gap-1 p-3 rounded-xl w-full duration-300"
										>
											<LogOut size={16} />
											Logout
										</button>
									)}
								</DropdownMenuItem>
							</DropdownMenuContent>

							<AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
