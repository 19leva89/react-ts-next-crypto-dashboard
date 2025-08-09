'use server'

import { prisma } from '@/lib/prisma'
import { getUserByEmail } from '@/data/user'
import { handleError } from '@/lib/handle-error'
import { saltAndHashPassword } from '@/lib/salt'
import { sendVerificationEmail } from '@/lib/send-email'
import { generateVerificationToken } from '@/lib/tokens'
import { RegisterSchema, TRegisterValues } from '@/components/shared/modals/auth-modal/forms/schemas'

export const registerUser = async (values: TRegisterValues) => {
	try {
		const validatedFields = RegisterSchema.safeParse(values)
		if (!validatedFields.success) {
			return { error: 'Invalid fields!' }
		}

		const { email, password, name } = validatedFields.data

		const user = await getUserByEmail(email)

		if (user) {
			if (user.accounts.length > 0)
				throw new Error('This email is linked to a social login. Please use GitHub or Google')

			if (!user.emailVerified) throw new Error('Email not confirmed')

			throw new Error('User already exists')
		}

		const createdUser = await prisma.user.create({
			data: {
				name,
				email,
				password: await saltAndHashPassword(password as string),
			},
		})

		const verificationToken = await generateVerificationToken(createdUser.email)

		await sendVerificationEmail(createdUser.email, verificationToken.token)
	} catch (error) {
		handleError(error, 'CREATE_USER')
	}
}
