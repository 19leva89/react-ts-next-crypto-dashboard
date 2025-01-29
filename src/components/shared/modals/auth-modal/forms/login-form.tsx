import Image from 'next/image'
import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'
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

interface Props {
	onClose?: VoidFunction
}

export const LoginForm = ({ onClose }: Props) => {
	const form = useForm<TFormLoginValues>({
		resolver: zodResolver(formLoginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = async (data: TFormLoginValues) => {
		try {
			const resp = await signIn('credentials', {
				...data,
				redirect: false,
			})

			if (resp?.error === 'CredentialsSignin') {
				toast.error('This email is linked to a social login. Please use GitHub or Google')
			}

			if (resp?.error === null) {
				toast.success('You have successfully logged in')

				onClose?.()
			}
		} catch (error) {
			console.error('Error [LOGIN]', error)
		}
	}

	return (
		<FormProvider {...form}>
			<form className="flex flex-col gap-5 h-full min-h-[450px]" onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="flex flex-col justify-between items-stretch flex-grow dark:bg-card">
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
						<Button loading={form.formState.isSubmitting} className="h-12 text-base w-full" type="submit">
							Login
						</Button>

						<div className="flex gap-2 w-full">
							<Button
								variant="outline"
								onClick={() =>
									signIn('github', {
										callbackUrl: '/',
										redirect: true,
									})
								}
								type="button"
								className="gap-2 h-12 p-2 flex-1"
							>
								<Image width={24} height={24} alt="GitHub" src="/svg/github-icon.svg" />
								GitHub
							</Button>

							<Button
								variant="outline"
								onClick={() =>
									signIn('google', {
										callbackUrl: '/',
										redirect: true,
									})
								}
								type="button"
								className="gap-2 h-12 p-2 flex-1"
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
