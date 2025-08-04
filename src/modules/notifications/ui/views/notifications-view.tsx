'use client'

import { enUS } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { BellRingIcon, CheckIcon, MoreVerticalIcon, ArrowRightIcon } from 'lucide-react'

import { useTRPC } from '@/trpc/client'
import { Notification } from '@/modules/notifications/schema'
import { ErrorState, LoadingState } from '@/components/shared'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Switch, Button } from '@/components/ui'

const getNotificationIcon = (type: Notification['type']) => {
	switch (type) {
		case 'LOGIN':
			return '🔑'
		case 'LOGOUT':
			return '🚪'
		case 'PRICE_ALERT':
			return '💰'
		default:
			return '🔔'
	}
}

export const NotificationsView = () => {
	const trpc = useTRPC()
	const router = useRouter()

	const { mutate: markAllAsRead } = useMutation(trpc.notifications.markAllAsRead.mutationOptions())
	const { data: notifications } = useSuspenseQuery(trpc.notifications.getNotifications.queryOptions())

	const handleNotificationClick = (notification: Notification) => {
		if (notification.type === 'PRICE_ALERT' && notification.coinId) {
			router.push(`/coins/${notification.coinId}`)
		} else if (notification.type === 'LOGIN' || notification.type === 'LOGOUT') {
			router.push('/profile')
		}
	}

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
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className='relative cursor-pointer p-4 transition-colors hover:bg-muted/50'
								onClick={() => handleNotificationClick(notification)}
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

											{notification.type === 'PRICE_ALERT' && (
												<ArrowRightIcon className='size-4 text-muted-foreground' />
											)}
										</div>

										<p className='mt-1 text-xs text-muted-foreground'>{notification.message}</p>

										<p className='mt-1 text-xs text-muted-foreground'>
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
												locale: enUS,
											})}
										</p>
									</div>

									<Button variant='ghost' size='icon' className='size-8'>
										<MoreVerticalIcon className='size-4' />
										<span className='sr-only'>More</span>
									</Button>
								</div>
							</div>
						))}
						{notifications.length === 0 && (
							<div className='p-4 text-center text-sm text-muted-foreground'>No notifications yet</div>
						)}
					</div>
				</CardContent>

				{notifications.length > 0 && (
					<CardFooter className='border-t bg-muted/20 p-4'>
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
