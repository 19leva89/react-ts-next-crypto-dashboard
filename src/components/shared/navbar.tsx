'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
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
import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { ModeToggle } from '@/components/shared'
import { useSelectedCurrency } from '@/hooks/use-selected-currency'

export const Navbar = () => {
	const trpc = useTRPC()
	const pathName = usePathname()

	const { data: session, status } = useSession()
	const { currency, changeCurrency } = useSelectedCurrency()

	const { data: exchangeRate } = useQuery(trpc.helpers.getExchangeRate.queryOptions())

	const [mounted, setMounted] = useState<boolean>(false)

	const handleUpdateExchangeRate = async (newCurrency: 'usd' | 'eur' | 'uah') => {
		changeCurrency(newCurrency)
	}

	// Needed to avoid hydration error
	useEffect(() => setMounted(true), [])

	return (
		<header className='sticky inset-x-0 top-0 isolate z-40 flex shrink-0 items-center justify-between gap-2 border-b border-gray-700 bg-background px-4 py-3 text-sm sm:px-6 sm:text-base'>
			<div className='flex items-center gap-4 sm:gap-14'>
				<SidebarTrigger size='lg' className='size-10 rounded-xl transition-colors duration-300 ease-in-out' />

				<div className='hidden items-center gap-2 sm:gap-6 lg:flex'>
					<div className='flex flex-col'>
						<h1 className='font-medium capitalize'>{pathName.split('/').at(-1) || 'Dashboard'}</h1>

						{status === 'loading' ? (
							<Skeleton className='h-5 w-36 rounded-xl' />
						) : (
							<p className='hidden text-sm text-gray-600 lg:block dark:text-slate-300'>
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

			<div className='flex gap-1 text-gray-500 sm:gap-3 dark:text-white'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							size='lg'
							className='group flex gap-3 rounded-xl px-4 text-sm transition-colors duration-300 ease-in-out'
						>
							<span className='relative top-[1px] text-sm'>{currency.toUpperCase()}</span>

							<div className='relative hidden size-6 transition-transform duration-300 group-hover:rotate-180 sm:block'>
								<ChevronsUpDownIcon size={18} className='absolute inset-0 m-auto size-4.5!' />
							</div>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align='start'
						className='flex w-23 min-w-[5rem] flex-col gap-2 rounded-xl shadow-lg'
					>
						{Object.entries(exchangeRate?.vsCurrencies || {}).map(([curr]) => (
							<DropdownMenuItem
								key={curr}
								onClick={() => handleUpdateExchangeRate(curr as 'usd' | 'eur' | 'uah')}
								className='rounded-xl p-0'
							>
								<Button
									variant='ghost'
									size='sm'
									className={cn('w-full rounded-xl', currency === curr && 'bg-accent text-accent-foreground')}
								>
									{curr.toUpperCase()}
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
