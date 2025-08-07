'use client'

import {
	BellRingIcon,
	CheckIcon,
	EllipsisVerticalIcon,
	TrashIcon,
	EyeIcon,
	LogInIcon,
	LogOutIcon,
	PiggyBankIcon,
	LoaderIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useMemo } from 'react'
import { enUS } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'

import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Switch,
} from '@/components/ui'
import { useTRPC } from '@/trpc/client'
import { DEFAULT_LIMIT } from '@/constants/default-limit'
import { Notification } from '@/modules/notifications/schema'
import { ErrorState, InfiniteScroll, LoadingState } from '@/components/shared'

const getNotificationIcon = (type: Notification['type']) => {
	switch (type) {
		case 'LOGIN':
			return <LogInIcon />
		case 'LOGOUT':
			return <LogOutIcon />
		case 'PRICE_ALERT':
			return <PiggyBankIcon />
	}
}

export const NotificationsView = () => {
	const trpc = useTRPC()
	const router = useRouter()
	const queryClient = useQueryClient()

	const queryOptions = trpc.notifications.getNotifications.infiniteQueryOptions(
		{ limit: DEFAULT_LIMIT },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	)

	const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isPending } = useInfiniteQuery(queryOptions)

	const notifications = useMemo(() => {
		const items = data?.pages.flatMap((page) => page.items) ?? []

		// Check for duplicate IDs
		const seen = new Set()
		items.forEach((notification) => {
			if (seen.has(notification.id)) {
				console.warn('Duplicate notification ID:', notification.id)
			} else {
				seen.add(notification.id)
			}
		})

		return items
	}, [data?.pages])

	const { mutate: markAllAsRead } = useMutation(
		trpc.notifications.markAllAsRead.mutationOptions({
			onSuccess: () => {
				// Optimistic cache update
				queryClient.setQueryData(
					trpc.notifications.getNotifications.infiniteQueryKey({ limit: DEFAULT_LIMIT }),
					(oldData: any) => {
						if (!oldData) return oldData

						return {
							...oldData,
							pages: oldData.pages.map((page: any) => ({
								...page,
								items: page.items.map((item: any) => ({
									...item,
									isRead: true,
								})),
							})),
						}
					},
				)

				toast.success('All notifications marked as read')
			},
		}),
	)

	const { mutate: deleteNotification } = useMutation(
		trpc.notifications.deleteNotification.mutationOptions({
			onSuccess: (_, notificationId) => {
				// Optimistic cache update
				queryClient.setQueryData(
					trpc.notifications.getNotifications.infiniteQueryKey({ limit: DEFAULT_LIMIT }),
					(oldData: any) => {
						if (!oldData) return oldData

						return {
							...oldData,
							pages: oldData.pages.map((page: any) => ({
								...page,
								items: page.items.filter((item: any) => item.id !== notificationId),
							})),
						}
					},
				)

				toast.success('Notification deleted')
			},
		}),
	)

	return (
		<div className='container mx-auto max-w-2xl'>
			<Card className='gap-0 overflow-hidden py-0'>
				<CardHeader className='flex flex-row items-center justify-between border-b py-6 max-[400px]:flex-col'>
					<div className='flex items-center space-x-2'>
						<BellRingIcon className='size-5 text-primary' />

						<CardTitle className='text-xl font-semibold'>Notifications</CardTitle>
					</div>

					<div className='flex items-center space-x-3'>
						<label
							htmlFor='dnd'
							className='cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
						>
							Do not disturb
						</label>
						<Switch id='dnd' aria-label='Do not disturb' className='cursor-pointer' />
					</div>
				</CardHeader>

				<CardContent className='p-0'>
					<div className='divide-y'>
						{notifications.map((notification, index) => (
							<div
								key={`${notification.id}-${index}`}
								className='relative cursor-pointer p-4 transition-colors hover:bg-muted/50'
							>
								<div className='flex items-start'>
									{!notification.isRead && <span className='absolute top-0 bottom-0 left-0 w-1 bg-primary' />}

									<div className='mr-3 text-xl'>{getNotificationIcon(notification.type)}</div>

									<div className='flex-1'>
										<div className='flex items-center justify-between'>
											<p
												className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}
											>
												{notification.title}
											</p>
										</div>

										<p className='mt-1 text-xs text-muted-foreground'>{notification.message}</p>

										<p className='mt-1 text-xs text-muted-foreground'>
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
												locale: enUS,
											})}
										</p>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='icon' className='group mt-0! shrink-0'>
												<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
													<EllipsisVerticalIcon size={16} className='absolute inset-0 m-auto' />
												</div>

												<span className='sr-only'>More</span>
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent side='right' align='start' sideOffset={0} className='rounded-xl'>
											{notification.type === 'PRICE_ALERT' && (
												<DropdownMenuItem
													onSelect={() => router.push(`/coins/${notification.coinId}`)}
													className='cursor-pointer rounded-xl p-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden'
												>
													<Button
														variant='ghost'
														size='icon'
														className='mx-2 flex items-center justify-start gap-3'
													>
														<EyeIcon size={16} />

														<span>View</span>
													</Button>
												</DropdownMenuItem>
											)}

											<DropdownMenuItem
												onClick={() => deleteNotification(notification.id)}
												className='cursor-pointer rounded-xl p-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden'
											>
												<Button
													variant='ghost'
													size='icon'
													className='mx-2 flex items-center justify-start gap-3'
												>
													<TrashIcon size={16} />

													<span>Delete</span>
												</Button>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						))}

						{isPending && (
							<div className='flex flex-col items-center justify-center gap-y-6 rounded-lg bg-background p-10 shadow-sm'>
								<LoaderIcon className='size-6 animate-spin text-primary' />
							</div>
						)}

						{!isPending && notifications.length === 0 && (
							<div className='p-4 text-center text-sm text-muted-foreground'>No notifications yet</div>
						)}
					</div>
				</CardContent>

				{notifications.length > 0 && (
					<CardFooter className='justify-between border-t bg-muted/20 p-4'>
						<InfiniteScroll
							isManual
							hasNextPage={hasNextPage}
							isFetchingNextPage={isFetchingNextPage}
							fetchNextPage={fetchNextPage}
						/>

						<Button
							variant='ghost'
							className='group flex items-center gap-2 text-primary hover:bg-transparent hover:underline'
							onClick={() => markAllAsRead()}
						>
							<CheckIcon className='size-4 transition-transform group-hover:scale-110' />
							Mark all as read
						</Button>
					</CardFooter>
				)}
			</Card>
		</div>
	)
}

export const NotificationsViewLoading = () => {
	return <LoadingState title='Loading notifications' description='This may take a few seconds' />
}

export const NotificationsViewError = () => {
	return <ErrorState title='Failed to load notifications' description='Please try again later' />
}
