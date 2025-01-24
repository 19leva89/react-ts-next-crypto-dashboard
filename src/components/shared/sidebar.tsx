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
import { ReactNode, useContext, useEffect, useState } from 'react'

import {
	activitiesPageUrl,
	billingPageUrl,
	cardsPageUrl,
	dashboardPageUrl,
	helpCenterPageUrl,
	invoicesPageUrl,
	newsPageUrl,
	notifPageUrl,
	reportsPageUrl,
	settingsPageUrl,
} from '@/lib/urls'
import { Button } from '@/components/ui'
import { Logo } from '@/components/shared'
import { useBodyModalEffect } from '@/hooks'
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
		path: dashboardPageUrl,
		icon: <Home size={18} />,
	},
	{
		name: 'News',
		path: newsPageUrl,
		icon: <Newspaper size={18} />,
	},
	{
		name: 'Activities',
		path: activitiesPageUrl,
		icon: <Activity size={18} />,
	},
	{
		name: 'Cards',
		path: cardsPageUrl,
		icon: <CreditCard size={18} />,
	},
	{
		name: 'Reports',
		path: reportsPageUrl,
		icon: <FileText size={18} />,
		isDropdown: true,
		dropdownItems: [
			{ name: 'Report type 1', path: reportsPageUrl },
			{ name: 'Report type 2', path: reportsPageUrl },
		],
	},
	{
		name: 'Notifications',
		path: notifPageUrl,
		icon: <Bell size={18} />,
	},
	{
		name: 'Billing',
		path: billingPageUrl,
		icon: <Wallet size={18} />,
	},
	{
		name: 'Invoices',
		path: invoicesPageUrl,
		icon: <Clipboard size={18} />,
	},
	{
		name: 'Help center',
		path: helpCenterPageUrl,
		icon: <HelpCircle size={18} />,
	},
	{
		name: 'Settings',
		path: settingsPageUrl,
		icon: <Settings size={18} />,
	},
]

interface DropdownSidebarItemProps {
	currentPathname: string
	sideBarItem: SideBarItem
}

const DropdownSidebarItem = ({ currentPathname, sideBarItem }: DropdownSidebarItemProps) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="relative">
			<button
				className={`flex justify-between gap-2 items-center rounded-xl p-3 w-full 
            ${currentPathname === sideBarItem.path ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 dark:hover:bg-blue-500'}`}
				onClick={() => {
					setIsOpen(!isOpen)
				}}
			>
				<div className="flex gap-3 items-center">
					<FileText size={18} />

					<span>{sideBarItem.name}</span>
				</div>

				<ChevronDown size={16} className={`duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
			</button>

			<ul
				className={`${isOpen ? 'flex' : 'hidden'} flex-col gap-1 my-4 p-1 rounded-xl shadow-lg absolute bg-white dark:bg-slate-700 w-full left-0`}
			>
				{sideBarItem.dropdownItems?.map((item, index) => (
					<li key={index}>
						<Link
							href={item.path}
							className="hover:bg-blue-100 dark:hover:bg-slate-600 p-3 rounded-xl w-full block"
						>
							{item.name}
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}

export const Sidebar = () => {
	const pathname = usePathname()

	const { sidebarState, setSidebarState } = useContext(sidebarStateContext)

	const [IsOpen, setIsOpen] = useState<boolean>(false)
	const [currentPathname, setCurrentPathname] = useState<string>('')

	useBodyModalEffect([sidebarState], sidebarState)

	useEffect(() => {
		setCurrentPathname(pathname)
	}, [pathname])

	return (
		<>
			<div
				className={`fixed top-0 w-64 h-full bg-white dark:bg-dark border-r dark:border-gray-700 pt-4 flex flex-col
            ${sidebarState ? ' left-0 ' : ' -left-full'} lg:left-0 duration-300 sm:duration-500 ease-linear z-[999]
            shadow-xl lg:shadow-none`}
			>
				<div className="flex">
					<Link href={dashboardPageUrl} className="px-4">
						<Logo />
					</Link>
				</div>

				<div className="mt-8 mb-4 px-4 flex items-center justify-between">
					<h2 className="text-gray-500 dark:text-white">Menu</h2>

					<Button variant="ghost" size="icon" className="rounded-xl" onClick={setSidebarState}>
						<X size={16} />
					</Button>
				</div>

				<div className="grow flex flex-col justify-between overflow-auto">
					<ul className="flex flex-col gap-1 text-sm font-medium grow overflow-auto px-4 pt-3">
						{sideBarData.map((sideBarItem, index) => (
							<li key={index}>
								{sideBarItem.isDropdown ? (
									<DropdownSidebarItem currentPathname={currentPathname} sideBarItem={sideBarItem} />
								) : (
									<Button
										asChild
										size="lg"
										variant={currentPathname === sideBarItem.path ? 'default' : 'outline'}
										className="flex gap-3 justify-start rounded-xl p-3"
									>
										<Link href={sideBarItem.path}>
											{sideBarItem.icon}

											<span className="text-base">{sideBarItem.name}</span>
										</Link>
									</Button>
								)}
							</li>
						))}
					</ul>

					<div className="p-2 relative">
						<button
							className="text-start flex gap-2 items-center 
                        hover:bg-blue-100 dark:hover:bg-slate-800 rounded-lg p-2"
							onClick={() => {
								setIsOpen(!IsOpen)
							}}
						>
							<Image src="/svg/profile-image.svg" alt="John Doe" width={40} height={40} />
							{/* <div className="p-6 bg-slate-200 rounded-full ">
                            </div> */}

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
			</div>

			<div
				className={`fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] dark:bg-slate-50 dark:opacity-30 z-[998] ${sidebarState ? 'block' : 'hidden'} lg:hidden`}
				onClick={setSidebarState}
			></div>
		</>
	)
}
