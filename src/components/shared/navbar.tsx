'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { ChevronsUpDownIcon, WalletIcon } from 'lucide-react'

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
		<header className='sticky inset-x-0 top-0 isolate z-40 flex shrink-0 items-center justify-between gap-2 border-b bg-background px-6 py-3 max-[640px]:px-4 max-[460px]:text-sm dark:border-gray-700'>
			<div className='flex items-center gap-14 max-[430px]:gap-4'>
				<SidebarTrigger />

				<div className='flex items-center gap-2 max-[950px]:hidden min-[460px]:gap-6 lg:block'>
					<div className='flex flex-col'>
						<h1 className='font-medium capitalize'>{pathName.split('/').at(-1) || 'Dashboard'}</h1>

						{status === 'loading' ? (
							<Skeleton className='h-5 w-36' />
						) : (
							<p className='hidden text-sm text-gray-600 min-[320px]:block dark:text-slate-300'>
								Welcome back, {session?.user.name || 'Guest'}!
							</p>
						)}
					</div>
				</div>

				<Button
					variant='default'
					size='lg'
					className='rounded-xl text-white transition-colors duration-300 ease-in-out'
				>
					<WalletIcon size={18} />

					<span>Connect wallet</span>
				</Button>
			</div>

			<div className='flex gap-3 text-gray-500 max-[460px]:gap-1 dark:text-white'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							size='lg'
							className='group flex gap-3 rounded-xl px-4 text-sm transition-colors duration-300 ease-in-out'
						>
							<span className='relative top-[1px] text-sm'>USD</span>

							<div className='relative size-6 transition-transform duration-300 group-hover:rotate-180 max-[460px]:hidden'>
								<ChevronsUpDownIcon size={18} className='absolute inset-0 m-auto size-4.5!' />
							</div>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align='start'
						className='flex w-23 min-w-[5rem] flex-col gap-2 rounded-xl bg-white shadow-lg dark:bg-gray-900'
					>
						{['CAD', 'EUR', 'XCD'].map((currency, i) => (
							<DropdownMenuItem key={i} className='rounded-xl p-0'>
								<Button variant='ghost' size='sm' className='w-full rounded-xl'>
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
