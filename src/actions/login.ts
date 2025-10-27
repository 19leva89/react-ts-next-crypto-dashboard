'use server'

import { compare } from 'bcrypt-ts'
import { revalidatePath } from 'next/cache'

import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import {
	createNotificationSchema,
	TCreateNotification,
	TNotificationMetadata,
} from '@/modules/notifications/schema'
import { handleError } from '@/lib/handle-error'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { getUserByEmail, getUserById } from '@/data/user'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { formatLoginMessage, LoginContext } from '@/lib/browser-utils'
import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '@/lib/send-email'
import { LoginSchema, TLoginValues } from '@/components/shared/modals/auth-modal/forms/schemas'

export const loginUser = async (provider: string) => {
	await signIn(provider, { redirectTo: DEFAULT_LOGIN_REDIRECT })

	revalidatePath('/')
}

export const credentialsLoginUser = async (values: TLoginValues) => {
	const validatedFields = LoginSchema.safeParse(values)

	if (!validatedFields.success) {
		return { error: 'Invalid fields!' }
	}

	const { email, password, code, rememberMe } = validatedFields.data

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

				// Clean up 2FA token
				await prisma.twoFactorToken.delete({
					where: { id: twoFactorToken.id },
				})

				// Handle 2FA confirmation
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
			rememberMe,
			redirect: false,
		})

		return { success: true }
	} catch (error) {
		console.error('Login error:', error)

		return { error: 'An unexpected error occurred. Please try again' }
	}
}

export const createLoginNotification = async (userId: string, context?: LoginContext) => {
	try {
		const existingUser = await getUserById(userId)

		if (!existingUser) {
			console.warn(`User with id ${userId} not found in database, skipping notification creation`)

			return
		}

		let message = 'You have successfully logged in'
		let title = 'Login Successful'

		const baseNotificationData: Partial<TCreateNotification> = {
			userId,
			type: 'LOGIN' as const,
			title,
			message,
			isRead: false,
		}

		if (context) {
			message = formatLoginMessage(context)
			title = 'Login'

			const metadata: TNotificationMetadata = {
				device: context.browserInfo.device,
				loginTime: new Date().toISOString(),
				securityAlert: true,
				browserDetails: {
					name: context.browserInfo.browser,
					os: context.browserInfo.os,
					device: context.browserInfo.device,
				},
			}

			baseNotificationData.title = title
			baseNotificationData.message = message
			baseNotificationData.ipAddress = context.ipAddress
			baseNotificationData.location = context.locationInfo.city
			baseNotificationData.browser = context.browserInfo.browser
			baseNotificationData.os = context.browserInfo.os
			baseNotificationData.userAgent = context.browserInfo.userAgent
			baseNotificationData.metadata = metadata
		}

		const validatedData = createNotificationSchema.parse(baseNotificationData)

		await prisma.notification.create({
			data: validatedData,
		})

		console.log(`Login notification created for user ${userId}`)
	} catch (error) {
		handleError(error, 'CREATE_LOGIN_NOTIFICATION')
	}
}
