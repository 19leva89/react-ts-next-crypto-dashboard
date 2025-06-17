'use client'

import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { FormProvider, useForm } from 'react-hook-form'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { Button } from '@/components/ui'
import { FormInput } from '@/components/shared/form'
import { Container, ErrorState, LoadingState, Title } from '@/components/shared'
import { UpdateProfileValues, UserProfile, updateProfileSchema } from '@/modules/settings/schema'

export const ProfileView = () => {
	const trpc = useTRPC()

	const { update } = useSession()
	const { data: profile } = useSuspenseQuery(trpc.settings.getProfile.queryOptions()) as { data: UserProfile }

	const deleteUserMutation = useMutation(trpc.settings.deleteUser.mutationOptions())
	const updateUserMutation = useMutation(trpc.settings.updateUserInfo.mutationOptions())

	const form = useForm<UpdateProfileValues>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			email: profile.email,
			name: profile.name || '',
			password: '',
			confirmPassword: '',
		},
	})

	const onSubmit = async (formData: UpdateProfileValues) => {
		try {
			await updateUserMutation.mutateAsync({
				email: formData.email || '',
				name: formData.name || '',
				...(formData.password ? { password: formData.password } : {}),
			})

			toast.success('Data updated 📝')

			await update()
		} catch (error) {
			console.error('Error updating user info:', error)

			toast.error(error instanceof Error ? error.message : 'Error while updating data')
		}
	}

	const handleDeleteAccount = async () => {
		try {
			await deleteUserMutation.mutateAsync()

			toast.success('Your account has been deleted')

			signOut()
		} catch (error) {
			console.error('Error deleting account:', error)

			toast.error(error instanceof Error ? error.message : 'Error while deleting account')
		}
	}

	return (
		<Container>
			<Title text='Personal information' size='md' className='font-bold' />

			<FormProvider {...form}>
				<form
					className='mt-10 flex w-96 flex-col gap-5 max-[400px]:w-full'
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<FormInput name='email' label='Email' type='email' required />

					<FormInput name='name' label='Full name' type='text' required />

					<FormInput name='password' label='New password' type='password' />

					<FormInput name='confirmPassword' label='Repeat password' type='password' />

					<Button
						variant='default'
						size='lg'
						type='submit'
						disabled={form.formState.isSubmitting || updateUserMutation.isPending}
						className='mt-10 rounded-xl text-base text-white transition-colors duration-300 ease-in-out'
					>
						Save
					</Button>

					<Button
						variant='destructive'
						size='lg'
						type='button'
						onClick={handleDeleteAccount}
						disabled={form.formState.isSubmitting || deleteUserMutation.isPending}
						className='rounded-xl text-base transition-colors duration-300 ease-in-out'
					>
						Delete account
					</Button>
				</form>
			</FormProvider>
		</Container>
	)
}

export const ProfileViewLoading = () => {
	return <LoadingState title='Loading profile' description='This may take a few seconds' />
}

export const ProfileViewError = () => {
	return <ErrorState title='Failed to load profile' description='Please try again later' />
}
