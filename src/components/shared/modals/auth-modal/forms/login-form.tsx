import Image from 'next/image'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui'
import { FormInput } from '@/components/shared/form'
import { TFormLoginValues, formLoginSchema } from './schemas'
import { loginUser, loginUserWithCreds } from '@/app/api/actions'

interface Props {
	onClose?: VoidFunction
}

export const LoginForm = ({ onClose }: Props) => {
	const { update } = useSession()

	const form = useForm<TFormLoginValues>({
		resolver: zodResolver(formLoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: TFormLoginValues) => {
		try {
			await loginUserWithCreds({
				email: data.email,
				password: data.password,
			})

			toast.success('You have successfully logged in')

			onClose?.()

			await update()
		} catch (error) {
			console.error('Error logging in:', error)

			toast.error(error instanceof Error ? error.message : 'Error while logging in')
		}
	}

	const handleLogin = async (provider: string) => {
		await loginUser(provider)

		await update()
	}

	return (
		<FormProvider {...form}>
			<form className="flex flex-col gap-5 h-full min-h-[450px]" onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="flex flex-col justify-between items-stretch grow dark:bg-card">
					<div>
						<CardHeader>
							<CardTitle>Login to your account</CardTitle>

							<CardDescription>Enter your email to log in to your account</CardDescription>
						</CardHeader>

						<CardContent className="flex flex-col gap-5">
							<FormInput name="email" type="email" placeholder="Email" required />

							<FormInput name="password" type="password" placeholder="Password" required />
						</CardContent>
					</div>

					<CardFooter className="flex flex-col gap-4">
						<Button
							variant="default"
							size="lg"
							type="submit"
							loading={form.formState.isSubmitting}
							className="text-base text-white w-full rounded-xl"
						>
							Login
						</Button>

						<div className="flex gap-2 w-full">
							<Button
								variant="outline"
								size="lg"
								type="button"
								onClick={() => handleLogin('github')}
								className="gap-2 p-2 flex-1 rounded-xl"
							>
								<Image width={24} height={24} alt="GitHub" src="/svg/github-icon.svg" />
								GitHub
							</Button>

							<Button
								variant="outline"
								size="lg"
								type="button"
								onClick={() => handleLogin('google')}
								className="gap-2 p-2 flex-1 rounded-xl"
							>
								<Image width={24} height={24} alt="Google" src="/svg/google-icon.svg" />
								Google
							</Button>
						</div>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
