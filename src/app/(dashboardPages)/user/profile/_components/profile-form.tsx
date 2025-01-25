'use client'

import toast from 'react-hot-toast'

import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'

import { User } from '@prisma/client'
import { Button } from '@/components/ui'

import { updateUserInfo } from '@/app/api/actions'
import { FormInput } from '@/components/shared/form'
import { Container, Title } from '@/components/shared'
import { updateUserInfoSchema, UserFormValues } from '@/constants/update-user-info-schema'

interface Props {
	data: User
}

export const ProfileForm = ({ data }: Props) => {
	const form = useForm({
		resolver: zodResolver(updateUserInfoSchema),
		defaultValues: {
			email: data.email,
			fullName: data.fullName,
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (formData: UserFormValues) => {
		try {
			const updateData = {
				email: formData.email,
				fullName: formData.fullName,
				...(formData.password ? { password: formData.password } : {}),
			}

			await updateUserInfo(updateData)

			toast.success('Data updated 📝')
		} catch (error) {
			console.error('Error updating user info:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Error while updating data')
			}
		}
	}

	return (
		<Container>
			<Title text="Personal information" size="md" className="font-bold" />

			<FormProvider {...form}>
				<form className="flex flex-col gap-5 w-96 mt-10" onSubmit={form.handleSubmit(onSubmit)}>
					<FormInput name="email" label="Email" type="email" required />

					<FormInput name="fullName" label="Full name" type="text" required />

					<FormInput name="password" label="New password" type="password" />

					<FormInput name="confirmPassword" label="Repeat password" type="password" />

					<Button disabled={form.formState.isSubmitting} className="h-12 text-base mt-10" type="submit">
						Save
					</Button>
				</form>
			</FormProvider>
		</Container>
	)
}
