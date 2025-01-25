'use client'

import Link from 'next/link'
import Image from 'next/image'
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
	X,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ReactNode, useContext, useEffect, useState } from 'react'

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui'
import { cn } from '@/lib'
import { Logo } from '@/components/shared'
import { Api } from '@/services/api-client'
import { sidebarStateContext } from '@/lib/context'
import { AuthModal } from '@/components/shared/modals/auth-modal'

type SideBarItem = {
	name: string
	path: string
	icon: ReactNode
	isDropdown?: boolean
	dropdownItems?: { name: string; path: string }[]
}

type SideBarData = SideBarItem[]

const sideBarData: SideBarData = [
	{
		name: 'Dashboard',
		path: '/dashboard',
		icon: <Home size={18} />,
	},
	{
		name: 'News',
		path: '/news',
		icon: <Newspaper size={18} />,
	},
	{
		name: 'Activities',
		path: '/activities',
		icon: <Activity size={18} />,
	},
	{
		name: 'Cards',
		path: '/cards',
		icon: <CreditCard size={18} />,
	},
	{
		name: 'Reports',
		path: '/reports',
		icon: <FileText size={18} />,
		isDropdown: true,
		dropdownItems: [
			{ name: 'Report type 1', path: '/reports/type-1' },
			{ name: 'Report type 2', path: '/reports/type-2' },
		],
	},
	{
		name: 'Notifications',
		path: '/notifications',
		icon: <Bell size={18} />,
	},
	{
		name: 'Billing',
		path: '/billing',
		icon: <Wallet size={18} />,
	},
	{
		name: 'Invoices',
		path: '/invoices',
		icon: <Clipboard size={18} />,
	},
	{
		name: 'Help center',
		path: '/help',
		icon: <HelpCircle size={18} />,
	},
	{
		name: 'Settings',
		path: '/settings',
		icon: <Settings size={18} />,
	},
]

export const Sidebar = () => {
	const pathname = usePathname()
	const { data: session } = useSession()
	const { sidebarState, setSidebarState } = useContext(sidebarStateContext)

	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [openAuthModal, setOpenAuthModal] = useState(false)
	const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				const data = await Api.auth.getMe()

				setUser({ name: data.fullName, email: data.email, avatar: data.avatar ?? '' })
			} catch (error) {
				console.error('Error fetching user data:', error)

				setUser(null)
			}
		}

		if (session) {
			fetchUserInfo()
		}
	}, [session])

	const onClickSignOut = () => {
		signOut({
			callbackUrl: '/',
		})
	}

	return (
		<>
			<div
				className={cn(
					'fixed top-0 w-64 h-full pt-4 flex flex-col justify-between bg-white dark:bg-dark border-r dark:border-gray-700 lg:left-0 duration-300 sm:duration-500 ease-linear shadow-xl lg:shadow-none z-[8]',
					sidebarState ? 'left-0' : '-left-full',
				)}
			>
				<div className="flex flex-col">
					<div className="flex px-4">
						<Link href={sideBarData[0].path}>
							<Logo />
						</Link>
					</div>

					<div className="mt-8 mb-4 px-4 h-10 flex items-center justify-between">
						<h2 className="text-gray-500 dark:text-white">Menu</h2>

						<Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={setSidebarState}>
							<X size={16} />
						</Button>
					</div>

					<div className="flex flex-col gap-2 px-4 w-[250px]">
						{sideBarData.map((sideBarItem, index) => (
							<div key={index} className="w-full">
								{sideBarItem.isDropdown ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="outline"
												size="lg"
												className="flex gap-3 items-center justify-between w-full p-3 rounded-xl group"
											>
												<div className="flex gap-3 items-center">
													{sideBarItem.icon}

													<span>{sideBarItem.name}</span>
												</div>

												<ChevronDown
													size={16}
													className="transition-transform duration-300 group-hover:rotate-180"
												/>
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent
											align="start"
											className="flex flex-col gap-2 w-[220] bg-white dark:bg-dark rounded-xl shadow-lg"
										>
											{sideBarItem.dropdownItems?.map((item, idx) => (
												<DropdownMenuItem key={idx} className="w-full h-10" asChild>
													<Link
														href={item.path}
														className="block w-full p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-600 cursor-pointer"
													>
														{item.name}
													</Link>
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<Button
										asChild
										size="lg"
										onClick={() => {
											setIsOpen(!isOpen)
										}}
										variant={pathname === sideBarItem.path ? 'default' : 'outline'}
										className="gap-3 justify-start rounded-xl p-3 w-full"
									>
										<Link href={sideBarItem.path}>
											{sideBarItem.icon}

											<span>{sideBarItem.name}</span>
										</Link>
									</Button>
								)}
							</div>
						))}
					</div>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="lg"
							className="gap-3 justify-between m-1 mb-4 p-3 rounded-xl group"
						>
							<div className="grow flex justify-between gap-2 items-center">
								<Avatar>
									<AvatarImage src={user?.avatar || '/svg/profile-image.svg'} alt={user?.name || 'User'} />
								</Avatar>

								<div className="flex flex-col gap-1 text-xs">
									{user ? (
										<>
											<span className="font-medium">{user.name}</span>
											<span className="text-gray-500">{user.email}</span>
										</>
									) : (
										<>
											<span className="font-medium">Guest</span>
											<span className="text-gray-500">Please login</span>
										</>
									)}
								</div>
								<ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
							</div>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						className="flex flex-col gap-2 w-[247px] rounded-xl shadow-lg bg-white dark:bg-dark"
					>
						<DropdownMenuItem className="w-full h-10 cursor-pointer" asChild>
							{!session ? (
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
			</div>

			{/* Overlay for mobile */}
			<div
				onClick={setSidebarState}
				className={cn(
					'fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] dark:bg-slate-50 dark:opacity-30 z-[7] lg:hidden',
					sidebarState ? 'block' : 'hidden',
				)}
			/>
		</>
	)
}
