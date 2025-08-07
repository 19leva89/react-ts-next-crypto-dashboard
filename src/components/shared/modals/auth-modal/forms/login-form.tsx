import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
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
import { loginUser } from '@/app/api/actions'
import { FormInput } from '@/components/shared/form'
import { TFormLoginValues, formLoginSchema } from '@/components/shared/modals/auth-modal/forms/schemas'

interface Props {
	onClose?: VoidFunction
}

export const LoginForm = ({ onClose }: Props) => {
	const router = useRouter()

	const { update } = useSession()

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const form = useForm<TFormLoginValues>({
		resolver: zodResolver(formLoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const handleCredentialsLogin = async (data: TFormLoginValues) => {
		setIsLoading(true)

		try {
			const result = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
			})

			if (result?.error) {
				let errorMessage = 'Something went wrong. Please try again'

				if (result.error === 'CredentialsSignin') {
					errorMessage = 'Invalid email or password'
				} else if (result.error.includes('social login')) {
					errorMessage = 'This email is linked to a social login. Please use GitHub or Google'
				} else if (result.error.includes('not verified')) {
					errorMessage = 'Email is not verified. Please check your inbox for verification link'
				}

				toast.error(errorMessage)

				return
			}

			if (result?.ok) {
				await update()
				router.refresh()

				onClose?.()
				toast.success('You have successfully logged in')
			}
		} catch (error) {
			console.error('Login error:', error)

			toast.error('An unexpected error occurred. Please try again')
		} finally {
			setIsLoading(false)
		}
	}

	const handleProviderLogin = async (provider: string) => {
		setIsLoading(true)

		try {
			await loginUser(provider)

			await update()

			onClose?.()
			toast.success('You have successfully logged in')
		} catch (error) {
			console.error('Provider login error:', error)

			toast.error('An unexpected error occurred. Please try again')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(handleCredentialsLogin)}
				className='flex h-full min-h-[450px] flex-col gap-5'
			>
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
							loading={isLoading || form.formState.isSubmitting}
							className='w-full rounded-xl text-base text-white transition-colors duration-300 ease-in-out'
						>
							Login
						</Button>

						<div className='flex w-full gap-2'>
							<Button
								variant='outline'
								size='lg'
								type='button'
								onClick={() => handleProviderLogin('github')}
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
								onClick={() => handleProviderLogin('google')}
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
