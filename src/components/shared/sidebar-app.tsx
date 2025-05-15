'use client'

import Link from 'next/link'
import {
	BellIcon,
	ChartNoAxesCombinedIcon,
	ChevronDownIcon,
	CreditCardIcon,
	FileTextIcon,
	HandCoinsIcon,
	HelpCircleIcon,
	HomeIcon,
	LogOutIcon,
	NewspaperIcon,
	SettingsIcon,
	UserIcon,
	WalletIcon,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ComponentProps, useState } from 'react'

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
	useSidebar,
} from '@/components/ui'
import { cn } from '@/lib'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/shared'
import { AuthModal } from '@/components/shared/modals/auth-modal'

// Menu items
const sideBarData = [
	{
		title: 'Dashboard',
		url: '/dashboard',
		icon: HomeIcon,
		protected: false,
	},
	{
		title: 'News',
		url: '/news',
		icon: NewspaperIcon,
		protected: false,
	},
	{
		title: 'Coins',
		url: '/protected/coins',
		icon: HandCoinsIcon,
		protected: true,
	},
	{
		title: 'Charts',
		url: '/protected/charts',
		icon: ChartNoAxesCombinedIcon,
		protected: true,
	},
	{
		title: 'Cards',
		url: '/protected/cards',
		icon: CreditCardIcon,
		protected: true,
	},
	{
		title: 'Reports',
		url: '/protected/reports',
		icon: FileTextIcon,
		protected: true,
	},
	{
		title: 'Notifications',
		url: '/protected/notifications',
		icon: BellIcon,
		protected: true,
	},
	{
		title: 'Billing',
		url: '/protected/billing',
		icon: WalletIcon,
		protected: true,
	},

	{
		title: 'Help center',
		url: '/help',
		icon: HelpCircleIcon,
		protected: false,
	},
]

export const SidebarApp = ({ ...props }: ComponentProps<typeof Sidebar>) => {
	const currentPath = usePathname()

	const { open } = useSidebar()
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
		<Sidebar side="left" variant="sidebar" collapsible="icon" className="z-50" {...props}>
			<SidebarHeader>
				<div className="flex items-center justify-center px-4 pt-1">
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
											<Link href={item.url} className="flex items-center gap-4 h-12">
												<item.icon className={open ? 'size-5!' : 'size-4'} />

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

			<SidebarFooter className="mx-2 p-0">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									variant="outline"
									size="lg"
									className={cn(
										'gap-3 justify-between mb-4 cursor-pointer group',
										open ? 'rounded-xl' : 'rounded-full',
									)}
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

										<div className="flex flex-col gap-1 text-xs">
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

										<div className="relative size-5 transition-transform duration-300 group-hover:rotate-180">
											<ChevronDownIcon size={16} className="absolute inset-0 m-auto" />
										</div>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align="start"
								className="z-100 flex flex-col gap-1 w-(--radix-popper-anchor-width) rounded-xl shadow-lg bg-white dark:bg-gray-900"
							>
								{!session?.user ? (
									<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
										<button
											onClick={() => {
												setOpenAuthModal(true)
											}}
											className="flex items-center gap-2 p-3 rounded-xl w-full"
										>
											<UserIcon size={16} />
											Login
										</button>
									</DropdownMenuItem>
								) : (
									<>
										<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
											<Link
												href="/protected/settings"
												className="flex items-center gap-2 p-3 rounded-xl w-full"
											>
												<SettingsIcon size={16} />
												Settings
											</Link>
										</DropdownMenuItem>

										<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
											<button
												onClick={() => signOut()}
												className="flex items-center gap-2 p-3 rounded-xl w-full"
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
