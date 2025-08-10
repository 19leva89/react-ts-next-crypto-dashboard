'use server'

import { compare } from 'bcrypt-ts'
import { revalidatePath } from 'next/cache'

import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getUserByEmail } from '@/data/user'
import { handleError } from '@/lib/handle-error'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '@/lib/send-email'
import { LoginSchema, TLoginValues } from '@/components/shared/modals/auth-modal/forms/schemas'

export const loginUser = async (provider: string) => {
	await signIn(provider, { redirectTo: '/coins' })

	revalidatePath('/')
}

export const credentialsLoginUser = async (values: TLoginValues) => {
	const validatedFields = LoginSchema.safeParse(values)

	if (!validatedFields.success) {
		return { error: 'Invalid fields!' }
	}

	const { email, password, code } = validatedFields.data

	try {
		const existingUser = await getUserByEmail(email)

		if (!existingUser || !existingUser.email) {
			return { error: 'Invalid email or password!' }
		}

		if (!existingUser.password && existingUser.accounts.length > 0) {
			return { error: 'This email is linked to a social login. Please use GitHub or Google' }
		}

		if (existingUser.password) {
			const passwordsMatch = await compare(password, existingUser.password)
			if (!passwordsMatch) {
				return { error: 'Invalid email or password!' }
			}
		} else {
			return { error: 'Invalid email or password!' }
		}

		if (!existingUser.emailVerified) {
			const verificationToken = await generateVerificationToken(existingUser.email)

			await sendVerificationEmail(verificationToken.email, verificationToken.token)

			return { error: 'Please verify your email first. We sent you a new verification email!' }
		}

		if (existingUser.isTwoFactorEnabled && existingUser.email) {
			if (code) {
				const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)

				if (!twoFactorToken) {
					return { error: 'Invalid 2FA code!' }
				}

				if (twoFactorToken.token !== code) {
					return { error: 'Invalid 2FA code!' }
				}

				const hasExpired = new Date(twoFactorToken.expires) < new Date()

				if (hasExpired) {
					return { error: '2FA code expired!' }
				}

				await prisma.twoFactorToken.delete({
					where: { id: twoFactorToken.id },
				})

				const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

				if (existingConfirmation) {
					await prisma.twoFactorConfirmation.delete({
						where: { id: existingConfirmation.id },
					})
				}

				await prisma.twoFactorConfirmation.create({
					data: {
						userId: existingUser.id,
					},
				})
			} else {
				const twoFactorToken = await generateTwoFactorToken(existingUser.email)

				await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)

				return { twoFactor: true }
			}
		}

		await signIn('credentials', {
			email,
			password,
			redirect: false,
		})

		return { success: true }
	} catch (error) {
		console.error('Login error:', error)

		return { error: 'An unexpected error occurred. Please try again' }
	}
}

export const createLoginNotification = async (userId: string) => {
	try {
		await prisma.notification.create({
			data: {
				userId,
				type: 'LOGIN',
				title: 'Login',
				message: 'You have successfully login',
			},
		})
	} catch (error) {
		handleError(error, 'CREATE_LOGIN_NOTIFICATION')
	}
}
