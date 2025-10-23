'use client'

import { useCallback, useState } from 'react'
import { TriangleAlertIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
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
	Spinner,
} from '@/components/ui'
import { FormInput } from '@/components/shared/form'
import { newPassword } from '@/actions/new-password'
import { NewPasswordSchema, TNewPasswordValues } from '@/components/shared/modals/auth-modal/forms/schemas'

export const NewPasswordForm = () => {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [error, setError] = useState<string | undefined>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | undefined>()

	const form = useForm<TNewPasswordValues>({
		resolver: zodResolver(NewPasswordSchema) as Resolver<TNewPasswordValues>,
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = useCallback(
		async (values: TNewPasswordValues) => {
			if (!token) {
				setError('Missing token!')
				return
			}

			try {
				setIsLoading(true)

				const data = await newPassword(values, token)

				setSuccess(data?.success)
				setError(data?.error)
			} catch (error) {
				console.error('Verification error:', error)

				setError('An error occurred during verification')
			} finally {
				setIsLoading(false)
			}
		},
		[token],
	)

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex min-h-screen w-full items-center justify-center p-4'
			>
				<Card className='w-full max-w-md dark:bg-card'>
					<div className='flex flex-col gap-5'>
						<CardHeader>
							<CardTitle>Enter a new password</CardTitle>

							<CardDescription>Enter your new password two times</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col gap-5'>
							<FormInput name='password' type='password' placeholder='Password' required />

							<FormInput name='confirmPassword' type='password' placeholder='Repeat password' required />

							{!isLoading && error && (
								<div className='flex items-center gap-x-2 rounded-xl bg-amber-200 p-3 text-sm dark:text-destructive'>
									<TriangleAlertIcon className='size-4' />

									<p>{error}</p>
								</div>
							)}

							{!isLoading && success && <p className='text-center text-green-600'>{success}</p>}
						</CardContent>
					</div>

					<CardFooter className='flex flex-col gap-4'>
						<Button
							variant='default'
							size='lg'
							type='submit'
							disabled={isLoading || form.formState.isSubmitting}
							className='w-full rounded-xl text-base text-white transition-colors duration-300 ease-in-out'
						>
							{(isLoading || form.formState.isSubmitting) && <Spinner className='size-5 text-white' />}

							{isLoading || form.formState.isSubmitting ? 'Resetting password' : 'Reset password'}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
