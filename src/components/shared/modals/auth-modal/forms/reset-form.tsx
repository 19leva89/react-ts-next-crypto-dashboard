'use client'

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
} from '@/components/ui'
import { FormInput } from '@/components/shared/form'
import { resetPassword } from '@/actions/reset-password'
import { ResetSchema, TResetValues } from '@/components/shared/modals/auth-modal/forms/schemas'

interface Props {
	onClose?: VoidFunction
}

export const ResetForm = ({ onClose }: Props) => {
	const router = useRouter()

	const { update } = useSession()

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const form = useForm<TResetValues>({
		resolver: zodResolver(ResetSchema) as Resolver<TResetValues>,
		defaultValues: {
			email: '',
		},
	})

	const onSubmit = async (data: TResetValues) => {
		setIsLoading(true)

		try {
			const reset = await resetPassword(data)

			if (reset?.error) {
				toast.error(reset.error)
				return
			}

			if (reset?.success) {
				await update()
				router.push('/')

				onClose?.()
				toast.success('Please verify your email. We sent you a link to reset password')
			}
		} catch (error) {
			console.error('Reset error:', error)

			toast.error('An unexpected error occurred. Please try again')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex min-h-screen w-full items-center justify-center p-4'
			>
				<Card className='w-full max-w-md dark:bg-card'>
					<div className='flex flex-col gap-5'>
						<CardHeader>
							<CardTitle>Forgot your password?</CardTitle>

							<CardDescription>Enter your email to reset your password</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col gap-5'>
							<FormInput name='email' type='email' placeholder='Email' required />
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
							Send reset email
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
