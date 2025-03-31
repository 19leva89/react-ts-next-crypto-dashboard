'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ChevronsUpDown, Wallet } from 'lucide-react'

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	SidebarTrigger,
	Skeleton,
} from '@/components/ui'
import { ModeToggle } from '@/components/shared'

export const Navbar = () => {
	const pathName = usePathname()

	const { data: session, status } = useSession()

	const [mounted, setMounted] = useState<boolean>(false)

	// Needed to avoid hydration error
	useEffect(() => setMounted(true), [])

	return (
		<header className="z-40 sticky inset-x-0 top-0 isolate bg-background flex shrink-0 items-center justify-between gap-2 border-b dark:border-gray-700 py-3 px-6 max-[640px]:px-4 max-[460px]:text-sm">
			<div className="flex items-center gap-14 max-[430px]:gap-4">
				<SidebarTrigger />

				<div className="flex lg:block items-center gap-2 min-[460px]:gap-6 max-[950px]:hidden">
					<div className="flex-col flex">
						<h1 className="font-medium capitalize">{pathName.split('/').at(-1) || 'Dashboard'}</h1>

						{status === 'loading' ? (
							<Skeleton className="h-5 w-36" />
						) : (
							<p className="text-sm text-gray-600 dark:text-slate-300 hidden min-[320px]:block">
								Welcome back, {session?.user.name || 'Guest'}!
							</p>
						)}
					</div>
				</div>

				<Button
					variant="default"
					size="lg"
					className="rounded-xl text-white transition-colors ease-in-out duration-300"
				>
					<Wallet size={18} />

					<span>Connect wallet</span>
				</Button>
			</div>

			<div className="flex gap-3 text-gray-500 dark:text-white max-[460px]:gap-1">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							size="lg"
							className="gap-3 rounded-xl text-sm px-4 transition-colors ease-in-out duration-300 group"
						>
							<span>USD</span>

							<div className="flex-col hidden min-[460px]:flex">
								<ChevronsUpDown
									size={20}
									className="transition-transform duration-300 group-hover:rotate-180"
								/>
							</div>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						className="flex flex-col gap-2 w-[92px] min-w-[5rem] rounded-xl shadow-lg bg-white dark:bg-gray-900"
					>
						{['CAD', 'EUR', 'XCD'].map((currency, index) => (
							<DropdownMenuItem key={index} className="rounded-xl p-0">
								<Button variant="ghost" size="sm" className="w-full rounded-xl">
									{currency}
								</Button>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{mounted && <ModeToggle />}
			</div>
		</header>
	)
}
