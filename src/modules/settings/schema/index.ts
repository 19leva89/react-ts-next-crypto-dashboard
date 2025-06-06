import { z } from 'zod'

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/

const ERROR_MESSAGES = {
	email: 'Please enter a valid email address',
	name: 'Enter full name',
	confirmPassword: 'Passwords do not match',
	password: {
		pattern:
			'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one digit',
	},
} as const

export const userProfileSchema = z.object({
	id: z.string(),
	name: z.string().trim().min(2, { message: ERROR_MESSAGES.name }),
	email: z.string().trim().email({ message: ERROR_MESSAGES.email }),
	image: z.string().nullable(),
})

export const updateProfileSchema = userProfileSchema
	.omit({ id: true, image: true })
	.extend({
		password: z
			.string()
			.optional()
			.refine((password) => !password || PASSWORD_REGEX.test(password), {
				message: ERROR_MESSAGES.password.pattern,
			}),
		confirmPassword: z.string().optional(),
	})
	.refine(({ password, confirmPassword }) => !password || password === confirmPassword, {
		message: ERROR_MESSAGES.confirmPassword,
		path: ['confirmPassword'],
	})

export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
