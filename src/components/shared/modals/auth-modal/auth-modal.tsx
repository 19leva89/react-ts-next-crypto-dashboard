'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/components/ui'
import { LoginForm, RegisterForm } from '@/components/shared/modals/auth-modal/forms'

interface Props {
	open: boolean
	onClose: () => void
}

export const AuthModal = ({ open, onClose }: Props) => {
	const handleClose = () => {
		onClose()
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent
				className='w-[95%] rounded-xl bg-white p-10 px-4 sm:w-120 sm:px-10 dark:bg-card'
				aria-describedby={undefined}
				data-testid='dialog-content'
			>
				<DialogTitle className='hidden' />

				<DialogDescription className='hidden' />

				<Tabs defaultValue='login' className='mt-2 w-full sm:w-100'>
					<TabsList
						data-testid='tabs-list'
						className='grid h-11 w-full grid-cols-2 rounded-xl bg-gray-100 dark:bg-gray-900'
					>
						<TabsTrigger
							data-testid='tab-trigger-login'
							value='login'
							className='h-9 cursor-pointer rounded-xl data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary'
						>
							Login
						</TabsTrigger>

						<TabsTrigger
							data-testid='tab-trigger-register'
							value='register'
							className='h-9 cursor-pointer rounded-xl data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary'
						>
							Register
						</TabsTrigger>
					</TabsList>

					<TabsContent value='login' data-testid='tabs-content-login' data-active='true'>
						<LoginForm onClose={handleClose} data-testid='login-form' />
					</TabsContent>

					<TabsContent value='register' data-testid='tabs-content-register' data-active='false'>
						<RegisterForm onClose={handleClose} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
