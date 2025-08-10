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
import { LoginForm } from './forms/login-form'
import { RegisterForm } from './forms/register-form'

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
				className='w-120 rounded-xl bg-white p-10 max-[500px]:w-[95%] max-[500px]:px-4 dark:bg-card'
				aria-describedby={undefined}
			>
				<DialogTitle className='hidden' />

				<DialogDescription className='hidden' />

				<Tabs defaultValue='account' className='mt-2 w-100 max-[500px]:w-full'>
					<TabsList className='grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-900'>
						<TabsTrigger
							value='login'
							className='cursor-pointer data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary'
						>
							Login
						</TabsTrigger>

						<TabsTrigger
							value='register'
							className='cursor-pointer data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:text-primary'
						>
							Register
						</TabsTrigger>
					</TabsList>

					<TabsContent value='login'>
						<LoginForm onClose={handleClose} />
					</TabsContent>

					<TabsContent value='register'>
						<RegisterForm onClose={handleClose} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
