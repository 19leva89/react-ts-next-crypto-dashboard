'use client'

import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, Resolver, useForm } from 'react-hook-form'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Separator,
} from '@/components/ui'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { credentialsLoginUser, loginUser } from '@/actions/login'
import { FormInput, FormCheckbox } from '@/components/shared/form'
import { TLoginValues, LoginSchema } from '@/components/shared/modals/auth-modal/forms/schemas'

interface Props {
	onClose?: VoidFunction
}

export const LoginForm = ({ onClose }: Props) => {
	const router = useRouter()

	const { update } = useSession()

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false)

	const form = useForm<TLoginValues>({
		resolver: zodResolver(LoginSchema) as Resolver<TLoginValues>,
		defaultValues: {
			email: '',
			password: '',
			rememberMe: false,
		},
	})

	const handleCredentialsLogin = async (data: TLoginValues) => {
		setIsLoading(true)

		try {
			const result = await credentialsLoginUser(data)

			if (result?.error) {
				toast.error(result.error)
				return
			}

			if (result?.twoFactor) {
				setShowTwoFactor(true)

				toast.success('Please verify your email first. We sent you a new 2FA code')
			}

			if (result?.success) {
				await update()

				onClose?.()
				toast.success('You have successfully login')

				router.push(DEFAULT_LOGIN_REDIRECT)
				router.refresh()
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
				<Card className='flex grow flex-col items-stretch justify-between py-3 md:py-6 dark:bg-card'>
					<div className='flex flex-col gap-2 md:gap-4'>
						<CardHeader className='px-3 md:px-6'>
							<CardTitle>Login to your account</CardTitle>

							<CardDescription>Enter your email to login to your account</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col gap-2 px-3 md:gap-4 md:px-6'>
							<FormInput name='email' type='email' placeholder='Email' required />

							<FormInput name='password' type='password' placeholder='Password' required />

							{showTwoFactor && <FormInput name='code' type='password' placeholder='2FA code' required />}

							<FormCheckbox name='rememberMe' label='Remember me' className='mt-2' required={false} />

							<Button
								asChild
								size='sm'
								variant='link'
								onClick={() => onClose?.()}
								className='px-0 font-normal'
							>
								<Link href='/auth/reset'>Forgot password?</Link>
							</Button>
						</CardContent>
					</div>

					<CardFooter className='flex flex-col gap-2 px-3 md:gap-4 md:px-6'>
						<Button
							variant='default'
							size='lg'
							type='submit'
							loading={isLoading || form.formState.isSubmitting}
							className='w-full rounded-xl text-base text-white transition-colors duration-300 ease-in-out'
						>
							{showTwoFactor ? 'Confirm' : 'Login'}
						</Button>

						<Separator className='relative my-4'>
							<span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground'>
								or continue with
							</span>
						</Separator>

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
