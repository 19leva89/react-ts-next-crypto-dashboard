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
			<form className='flex h-full min-h-[450px] flex-col gap-5' onSubmit={form.handleSubmit(onSubmit)}>
				<Card className='flex grow flex-col items-stretch justify-between dark:bg-card'>
					<div className='flex flex-col gap-5'>
						<CardHeader>
							<CardTitle>Login to your account</CardTitle>

							<CardDescription>Enter your email to log in to your account</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col gap-5'>
							<FormInput name='email' type='email' placeholder='Email' required />

							<FormInput name='password' type='password' placeholder='Password' required />
						</CardContent>
					</div>

					<CardFooter className='flex flex-col gap-4'>
						<Button
							variant='default'
							size='lg'
							type='submit'
							loading={form.formState.isSubmitting}
							className='w-full rounded-xl text-base text-white transition-colors duration-300 ease-in-out'
						>
							Login
						</Button>

						<div className='flex w-full gap-2'>
							<Button
								variant='outline'
								size='lg'
								type='button'
								onClick={() => handleLogin('github')}
								className='flex-1 gap-2 rounded-xl p-2 transition-colors duration-300 ease-in-out'
							>
								<Image
									width={24}
									height={24}
									alt='GitHub'
									src='/svg/github-icon.svg'
									className='dark:brightness-200 dark:invert'
								/>
								GitHub
							</Button>

							<Button
								variant='outline'
								size='lg'
								type='button'
								onClick={() => handleLogin('google')}
								className='flex-1 gap-2 rounded-xl p-2 transition-colors duration-300 ease-in-out'
							>
								<Image width={24} height={24} alt='Google' src='/svg/google-icon.svg' />
								Google
							</Button>
						</div>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
