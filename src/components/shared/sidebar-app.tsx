'use client'

import Link from 'next/link'
import {
	Bell,
	ChartNoAxesCombined,
	ChevronDown,
	CreditCard,
	FileText,
	HandCoins,
	HelpCircle,
	Home,
	LogOut,
	Newspaper,
	Settings,
	User,
	Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

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
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/shared'
import { AuthModal } from '@/components/shared/modals/auth-modal'

// Menu items
const sideBarData = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: Home,
		protected: false,
	},
	{
		title: 'News',
		url: '/news',
		icon: Newspaper,
		protected: false,
	},
	{
		title: 'Coins',
		url: '/protected/coins',
		icon: HandCoins,
		protected: true,
	},
	{
		title: 'Charts',
		url: '/protected/charts',
		icon: ChartNoAxesCombined,
		protected: true,
	},
	{
		title: 'Cards',
		url: '/protected/cards',
		icon: CreditCard,
		protected: true,
	},
	{
		title: 'Reports',
		url: '/protected/reports',
		icon: FileText,
		protected: true,
	},
	{
		title: 'Notifications',
		url: '/protected/notifications',
		icon: Bell,
		protected: true,
	},
	{
		title: 'Billing',
		url: '/protected/billing',
		icon: Wallet,
		protected: true,
	},

	{
		title: 'Help center',
		url: '/help',
		icon: HelpCircle,
		protected: false,
	},
]

export const SidebarApp = () => {
	const currentPath = usePathname()

	const { data: session, status } = useSession()

	const [openAuthModal, setOpenAuthModal] = useState<boolean>(false)

	// Filtering sideBarData based on authorization
	const filteredSideBarData = sideBarData.filter((item) => {
		if (item.protected && !session?.user) {
			return false
		}

		return true
	})

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
							{filteredSideBarData.map((item) => {
								const isActive = currentPath === item.url

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton className="text-lg" asChild isActive={isActive}>
											<Link href={item.url} className="flex items-center gap-4 h-[48px]">
												<item.icon className="!w-5 !h-5" />

												<span>{item.title}</span>
											</Link>
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
										{status === 'loading' ? (
											<Skeleton className="w-10 h-10 rounded-full" />
										) : (
											<Avatar>
												<AvatarImage
													src={session?.user.image || '/svg/profile-image.svg'}
													alt={session?.user.name || 'User'}
													className="object-contain"
												/>
											</Avatar>
										)}

										<div className="flex flex-col gap-1 text-xs text-center">
											{status === 'loading' ? (
												<>
													<Skeleton className="w-32 h-4" />
													<Skeleton className="w-32 h-4" />
												</>
											) : (
												<>
													<span className="font-medium">{session?.user.name || 'Guest'}</span>
													<span className="text-gray-500">{session?.user.email || 'Please login'}</span>
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
								className="z-[100] flex flex-col gap-1 w-[--radix-popper-anchor-width] rounded-xl shadow-lg bg-white dark:bg-dark"
							>
								{!session?.user ? (
									<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
										<button
											onClick={() => {
												setOpenAuthModal(true)
											}}
											className="flex items-center gap-2 p-3 rounded-xl w-full duration-300"
										>
											<User size={16} />
											Login
										</button>
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
											<Link
												href={'/protected/settings'}
												className="flex items-center gap-2 p-3 rounded-xl w-full duration-300"
											>
												<Settings size={16} />
												Settings
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
											<button
												onClick={() => signOut()}
												className="flex items-center gap-2 p-3 rounded-xl w-full duration-300"
											>
												<LogOut size={16} />
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
