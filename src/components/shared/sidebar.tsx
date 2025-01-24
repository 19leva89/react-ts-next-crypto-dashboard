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
	Newspaper,
	Settings,
	Wallet,
	X,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { ReactNode, useContext, useState } from 'react'

import {
	Button,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui'
import { Logo } from '@/components/shared'
import { sidebarStateContext } from '@/lib/context'

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
	const { sidebarState, setSidebarState } = useContext(sidebarStateContext)

	const [IsOpen, setIsOpen] = useState<boolean>(false)

	return (
		<>
			<div
				className={`fixed top-0 w-64 h-full pt-4 flex flex-col bg-white border-r dark:border-gray-700
					 lg:left-0 duration-300 sm:duration-500 ease-linear shadow-xl lg:shadow-none
					 ${sidebarState ? 'left-0' : '-left-full'} z-[999]`}
			>
				<div className="flex px-4">
					<Link href={sideBarData[0].path}>
						<Logo />
					</Link>
				</div>

				<div className="mt-8 mb-4 px-4 flex items-center justify-between">
					<h2 className="text-gray-500 dark:text-white">Menu</h2>

					<Button variant="ghost" size="icon" className="rounded-xl lg:hidden" onClick={setSidebarState}>
						<X size={16} />
					</Button>
				</div>

				<NavigationMenu className="items-baseline">
					<NavigationMenuList className="flex flex-col gap-2 px-4 w-[250px]">
						{sideBarData.map((sideBarItem, index) => (
							<NavigationMenuItem key={index} className="w-full">
								{sideBarItem.isDropdown ? (
									<>
										<NavigationMenuTrigger className="flex gap-3 items-center justify-between w-full p-3 rounded-xl">
											<div className="flex gap-3 items-center">
												{sideBarItem.icon}
												<span>{sideBarItem.name}</span>
											</div>
										</NavigationMenuTrigger>

										<NavigationMenuContent className="w-full mt-2 p-2 bg-white dark:bg-dark rounded-lg shadow-lg">
											<ul className="flex flex-col gap-1">
												{sideBarItem.dropdownItems?.map((item, idx) => (
													<li key={idx}>
														<Link
															href={item.path}
															className="block p-3 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600"
														>
															{item.name}
														</Link>
													</li>
												))}
											</ul>
										</NavigationMenuContent>
									</>
								) : (
									<Button
										asChild
										size="lg"
										variant={pathname === sideBarItem.path ? 'default' : 'outline'}
										className="flex gap-3 justify-start rounded-xl p-3 w-full"
									>
										<Link href={sideBarItem.path}>
											{sideBarItem.icon}
											<span>{sideBarItem.name}</span>
										</Link>
									</Button>
								)}
							</NavigationMenuItem>
						))}
					</NavigationMenuList>
				</NavigationMenu>

				<div className="p-2 relative">
					<button
						className="text-start flex gap-2 items-center 
                        hover:bg-blue-100 dark:hover:bg-slate-800 rounded-lg p-2"
						onClick={() => {
							setIsOpen(!IsOpen)
						}}
					>
						<Image src="/svg/profile-image.svg" alt="John Doe" width={40} height={40} />

						<div className="grow flex justify-between gap-2 items-center">
							<div className="flex flex-col gap-1 text-xs">
								<span className="font-medium">John Doe</span>

								<span className="text-gray-500">youremail@example.com</span>
							</div>

							<ChevronDown size={16} className={`duration-300 ${IsOpen ? 'rotate-180' : 'rotate-0'}`} />
						</div>
					</button>

					<ul
						className={`w-[90%] absolute ${IsOpen ? 'flex' : 'hidden'} bottom-full flex-col gap-1 p-1 rounded-xl shadow-lg bg-white dark:bg-slate-700`}
					>
						<li>
							<a
								href="/login"
								className="hover:bg-blue-100 dark:hover:bg-slate-600 p-3 rounded-xl w-full block duration-300"
							>
								Login
							</a>
						</li>

						<li>
							<a
								href="/register"
								className="hover:bg-blue-100 dark:hover:bg-slate-600 p-3 rounded-xl w-full block duration-300"
							>
								Create account
							</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Overlay for mobile */}
			<div
				className={`fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] dark:bg-slate-50 dark:opacity-30 z-[998] ${
					sidebarState ? 'block' : 'hidden'
				} lg:hidden`}
				onClick={setSidebarState}
			></div>
		</>
	)
}
