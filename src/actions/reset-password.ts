'use server'

import { getUserByEmail } from '@/data/user'
import { sendPasswordResetEmail } from '@/lib/send-email'
import { generatePasswordResetToken } from '@/lib/tokens'
import { ResetSchema, TResetValues } from '@/components/shared/modals/auth-modal/forms/schemas'

export const resetPassword = async (values: TResetValues) => {
	const validatedFields = ResetSchema.safeParse(values)

	if (!validatedFields.success) {
		return { error: 'Invalid emaiL!' }
	}

	const { email } = validatedFields.data

	const existingUser = await getUserByEmail(email)

	if (!existingUser) {
		return { error: 'Email not found!' }
	}

	const passwordResetToken = await generatePasswordResetToken(email)
	await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)

	return { success: 'Reset email sent!' }
}
