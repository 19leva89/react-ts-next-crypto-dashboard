'use client'

import { LoginForm } from './forms/login-form'
import { RegisterForm } from './forms/register-form'
import { DialogDescription } from '@/components/ui/dialog'

import { Dialog, DialogContent, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

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
				className="w-[480px] p-10 bg-white dark:bg-card rounded-xl max-[500px]:w-[95%] max-[500px]:px-4"
				aria-describedby={undefined}
			>
				<DialogTitle className="hidden" />

				<DialogDescription className="hidden" />

				<Tabs defaultValue="account" className="w-[400px] max-[500px]:w-full">
					<TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-dark">
						<TabsTrigger
							value="login"
							className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary"
						>
							Login
						</TabsTrigger>

						<TabsTrigger
							value="register"
							className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary"
						>
							Register
						</TabsTrigger>
					</TabsList>

					<TabsContent value="login">
						<LoginForm onClose={handleClose} />
					</TabsContent>

					<TabsContent value="register">
						<RegisterForm onClose={handleClose} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	)
}
