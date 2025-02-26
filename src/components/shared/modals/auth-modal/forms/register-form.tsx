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
import { useToast } from '@/hooks'
import { registerUser } from '@/app/api/actions'
import { FormInput } from '@/components/shared/form'
import { TFormRegisterValues, formRegisterSchema } from './schemas'

interface Props {
	onClose?: VoidFunction
}

export const RegisterForm = ({ onClose }: Props) => {
	const { toast } = useToast()

	const form = useForm<TFormRegisterValues>({
		resolver: zodResolver(formRegisterSchema),
		defaultValues: {
			email: '',
			name: '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (data: TFormRegisterValues) => {
		try {
			await registerUser({
				name: data.name,
				email: data.email,
				password: data.password,
			})

			toast({
				title: '✅ Success',
				description: 'Registration successful 📝. Confirm your email',
				variant: 'default',
			})

			onClose?.()
		} catch (error) {
			console.error('Error registering:', error)

			toast({
				title: '🚨 Error',
				description: error instanceof Error ? error.message : 'Error while registering',
				variant: 'destructive',
			})
		}
	}

	return (
		<FormProvider {...form}>
			<form className="flex flex-col gap-5 h-full min-h-[450px]" onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="flex flex-col justify-between items-stretch flex-grow">
					<div>
						<CardHeader>
							<CardTitle>Account registration</CardTitle>

							<CardDescription>Enter your information to register an account</CardDescription>
						</CardHeader>

						<CardContent className="flex flex-col gap-5">
							<FormInput name="email" type="email" placeholder="Email" required />

							<FormInput name="name" type="text" placeholder="Full name" required />

							<FormInput name="password" type="password" placeholder="Password" required />

							<FormInput name="confirmPassword" type="password" placeholder="Repeat password" required />
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
							Register
						</Button>
					</CardFooter>
				</Card>
			</form>
		</FormProvider>
	)
}
