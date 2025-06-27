'use client'

import { MoreVertical, BellRing, Check } from 'lucide-react'

import { ErrorState, LoadingState } from '@/components/shared'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Switch, Button } from '@/components/ui'

const notifications = [
	{
		id: 1,
		title: 'New inspection assigned: QW0001 - Pepsi Asia',
		time: 'Now',
		read: false,
	},
	{
		id: 2,
		title: 'New inspection assigned: AR5567 - Pepsi Europe',
		time: '1h ago',
		read: false,
	},
	{
		id: 3,
		title: 'Inspection import has been successfully created',
		time: '4h ago',
		read: true,
	},
	{
		id: 4,
		title: 'Terms of use was updated tempus',
		time: '05 May 2019',
		read: true,
	},
]

export const NotificationsView = () => {
	return (
		<div className='container mx-auto max-w-2xl'>
			<Card className='gap-0 overflow-hidden py-0'>
				<CardHeader className='flex flex-row items-center justify-between border-b py-6 max-[400px]:flex-col'>
					<div className='flex items-center space-x-2'>
						<BellRing className='size-5 text-primary' />

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
							<div key={notification.id} className='relative p-4 transition-colors hover:bg-muted/50'>
								<div className='flex items-start'>
									{!notification.read && <span className='absolute top-0 bottom-0 left-0 w-1 bg-primary' />}

									<div className='flex-1'>
										<p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
											{notification.title}
										</p>

										<p className='mt-1 text-xs text-muted-foreground'>{notification.time}</p>
									</div>

									<Button variant='ghost' size='icon' className='size-8'>
										<MoreVertical className='size-4' />

										<span className='sr-only'>More</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>

				<CardFooter className='border-t bg-muted/20 p-4'>
					<Button
						variant='ghost'
						className='group flex items-center gap-2 text-primary hover:bg-transparent hover:underline'
					>
						<Check className='size-4 transition-transform group-hover:scale-110' />
						Mark all as read
					</Button>
				</CardFooter>
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
