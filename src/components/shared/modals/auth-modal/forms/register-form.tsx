import { toast } from 'sonner'
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
import { registerUser } from '@/actions/register'
import { FormInput } from '@/components/shared/form'
import { TRegisterValues, RegisterSchema } from '@/components/shared/modals/auth-modal/forms/schemas'

interface Props {
	onClose?: VoidFunction
}

export const RegisterForm = ({ onClose }: Props) => {
	const form = useForm<TRegisterValues>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: '',
			name: '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: TRegisterValues) => {
		try {
			await registerUser({
				email: data.email,
				password: data.password,
				name: data.name,
				confirmPassword: data.confirmPassword,
			})

			toast.success('Registration successful 📝. Confirm your email')

			onClose?.()
		} catch (error) {
			console.error('Error registering:', error)
			toast.error(error instanceof Error ? error.message : 'Error while registering')
		}
	}

	return (
		<FormProvider {...form}>
			<form className='flex h-full min-h-[450px] flex-col gap-5' onSubmit={form.handleSubmit(onSubmit)}>
				<Card className='flex grow flex-col items-stretch justify-between'>
					<div className='flex flex-col gap-5'>
						<CardHeader>
							<CardTitle>Account registration</CardTitle>

							<CardDescription>Enter your information to register an account</CardDescription>
						</CardHeader>

						<CardContent className='flex flex-col gap-5'>
							<FormInput name='email' type='email' placeholder='Email' required />

							<FormInput name='name' type='text' placeholder='Full name' required />

							<FormInput name='password' type='password' placeholder='Password' required />

							<FormInput name='confirmPassword' type='password' placeholder='Repeat password' required />
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
							Register
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
