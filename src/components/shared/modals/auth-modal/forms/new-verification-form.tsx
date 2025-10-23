'use client'

import { TriangleAlertIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { useCallback, useEffect, useState } from 'react'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Spinner,
} from '@/components/ui'
import { newVerification } from '@/actions/new-verification'

export const NewVerificationForm = () => {
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	const [error, setError] = useState<string | undefined>()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [success, setSuccess] = useState<string | undefined>()

	// Simplified form since we don't need form inputs
	const form = useForm({
		defaultValues: {},
	})

	const onSubmit = useCallback(async () => {
		if (!token) {
			setError('Missing token!')
			return
		}

		try {
			setIsLoading(true)

			const data = await newVerification(token)

			setSuccess(data?.success)
			setError(data?.error)
		} catch (error) {
			console.error('Verification error:', error)

			setError('An error occurred during verification')
		} finally {
			setIsLoading(false)
		}
	}, [token])

	useEffect(() => {
		onSubmit()
	}, [onSubmit])

	return (
		<FormProvider {...form}>
			<form className='flex min-h-screen w-full items-center justify-center p-4'>
				<Card className='w-full max-w-md dark:bg-card'>
					<div className='flex flex-col gap-5'>
						<CardHeader className='flex items-center'>
							<CardTitle>Email verification</CardTitle>

							<CardDescription>Confirming your verification</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col items-center gap-5'>
							{isLoading && <Spinner className='size-6' />}

							{!isLoading && error && (
								<div className='flex items-center gap-x-2 rounded-xl bg-amber-200 p-3 text-sm dark:text-destructive'>
									<TriangleAlertIcon className='size-4' />

									<p>{error}</p>
								</div>
							)}

							{!isLoading && success && <p className='text-green-600'>{success}</p>}
						</CardContent>
					</div>

					<CardFooter className='flex flex-col gap-4'>
						{!isLoading && error && <p>Please login again</p>}

						{success && <p>Please login</p>}
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
