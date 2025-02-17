'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { FormProvider, useForm } from 'react-hook-form'

import { User } from '@prisma/client'
import { Button } from '@/components/ui'

import { useToast } from '@/hooks'
import { FormInput } from '@/components/shared/form'
import { Container, Title } from '@/components/shared'
import { deleteUser, updateUserInfo } from '@/app/api/actions'
import { updateUserInfoSchema, UserFormValues } from '@/constants/update-user-info-schema'

interface Props {
	data: User
}

export const ProfileForm = ({ data }: Props) => {
	const { toast } = useToast()
	const { update } = useSession()

	const form = useForm({
		resolver: zodResolver(updateUserInfoSchema),
		defaultValues: {
			email: data.email,
			name: data.name || '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (formData: UserFormValues) => {
		try {
			await updateUserInfo({
				email: formData.email,
				name: formData.name,
				...(formData.password ? { password: formData.password } : {}),
			})

			toast({
				title: 'Success ✅',
				description: 'Data updated 📝',
				variant: 'default',
			})

			await update()
		} catch (error) {
			console.error('Error updating user info:', error)

			toast({
				title: 'Error 🚨',
				description: error instanceof Error ? error.message : 'Error while updating data',
				variant: 'destructive',
			})
		}
	}

	const handleDeleteAccount = async () => {
		try {
			await deleteUser()

			toast({
				title: 'Success ✅',
				description: 'Your account has been deleted',
				variant: 'default',
			})

			signOut()
		} catch (error) {
			console.error('Error deleting account:', error)

			toast({
				title: 'Error 🚨',
				description: error instanceof Error ? error.message : 'Error while deleting account',
				variant: 'destructive',
			})
		}
	}

	return (
		<Container>
			<Title text="Personal information" size="md" className="font-bold" />

			<FormProvider {...form}>
				<form className="flex flex-col gap-5 w-96 mt-10" onSubmit={form.handleSubmit(onSubmit)}>
					<FormInput name="email" label="Email" type="email" required />

					<FormInput name="name" label="Full name" type="text" required />

					<FormInput name="password" label="New password" type="password" />

					<FormInput name="confirmPassword" label="Repeat password" type="password" />

					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
						className="h-12 text-base mt-10 rounded-xl"
					>
						Save
					</Button>

					<Button
						variant="destructive"
						size="sm"
						type="button"
						onClick={handleDeleteAccount}
						disabled={form.formState.isSubmitting}
						className="h-12 text-base rounded-xl"
					>
						Delete account
					</Button>
				</form>
			</FormProvider>
		</Container>
	)
}
