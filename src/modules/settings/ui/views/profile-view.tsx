'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { FormProvider, Resolver, useForm } from 'react-hook-form'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Button,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	Switch,
} from '@/components/ui'
import { useTRPC } from '@/trpc/client'
import { FormInput } from '@/components/shared/form'
import { Container, ErrorState, LoadingState, Title } from '@/components/shared'
import { TUpdateProfileValues, updateProfileSchema } from '@/modules/settings/schema'

export const ProfileView = () => {
	const trpc = useTRPC()
	const router = useRouter()
	const deleteUserMutation = useMutation(trpc.settings.deleteUser.mutationOptions())
	const updateUserMutation = useMutation(trpc.settings.updateUserInfo.mutationOptions())

	const { update } = useSession()
	const { data: profile } = useSuspenseQuery(trpc.settings.getProfile.queryOptions())

	const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)

	const form = useForm<TUpdateProfileValues>({
		resolver: zodResolver(updateProfileSchema) as Resolver<TUpdateProfileValues>,
		defaultValues: {
			email: profile?.email || undefined,
			name: profile?.name || undefined,
			password: undefined,
			confirmPassword: undefined,
			isTwoFactorEnabled: profile?.isTwoFactorEnabled || undefined,
		},
	})

	const onSubmit = async (formData: TUpdateProfileValues) => {
		try {
			await updateUserMutation.mutateAsync({
				email: formData.email || undefined,
				name: formData.name || undefined,
				...(formData.password ? { password: formData.password } : {}),
			})

			toast.success('Data updated 📝')

			await update()
		} catch (error) {
			console.error('Error updating user info:', error)

			toast.error(error instanceof Error ? error.message : 'Error while updating data')
		}
	}

	const handleTwoFactorToggle = async (checked: boolean) => {
		form.setValue('isTwoFactorEnabled', checked)

		try {
			await updateUserMutation.mutateAsync({
				isTwoFactorEnabled: checked,
			})

			toast.success(`Two-factor authentication ${checked ? 'enabled' : 'disabled'}`)

			await update()
		} catch (error) {
			console.error('Error updating 2FA:', error)

			toast.error(error instanceof Error ? error.message : 'Failed to update 2FA')
		}
	}

	const handleDeleteAccount = async () => {
		try {
			await deleteUserMutation.mutateAsync()

			toast.success('Your account has been deleted')

			signOut()
			router.push('/')
		} catch (error) {
			console.error('Error deleting account:', error)

			toast.error(error instanceof Error ? error.message : 'Error while deleting account')
		} finally {
			setShowDeleteDialog(false)
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

					{profile?.isOAuth === false && (
						<FormField
							control={form.control}
							name='isTwoFactorEnabled'
							render={({ field }) => (
								<FormItem className='mt-8 flex flex-row items-center justify-between rounded-lg border p-3 shadow-xs'>
									<div className='space-y-0.5'>
										<FormLabel>Two Factor Authentication</FormLabel>

										<FormDescription>Enable two factor authentication for your account</FormDescription>
									</div>

									<FormControl>
										<Switch
											disabled={updateUserMutation.isPending}
											checked={field.value}
											onCheckedChange={handleTwoFactorToggle}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					)}

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
						onClick={() => setShowDeleteDialog(true)}
						disabled={deleteUserMutation.isPending || updateUserMutation.isPending}
						className='rounded-xl text-base transition-colors duration-300 ease-in-out'
					>
						{deleteUserMutation.isPending ? 'Deleting...' : 'Delete account'}
					</Button>
				</form>
			</FormProvider>

			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete your account and remove your data
							from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteUserMutation.isPending}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							onClick={handleDeleteAccount}
							disabled={deleteUserMutation.isPending || updateUserMutation.isPending}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{deleteUserMutation.isPending || updateUserMutation.isPending
								? 'Deleting...'
								: 'Delete account'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Container>
	)
}

export const ProfileViewLoading = () => {
	return <LoadingState title='Loading profile' description='This may take a few seconds' />
}

export const ProfileViewError = () => {
	return <ErrorState title='Failed to load profile' description='Please try again later' />
}
