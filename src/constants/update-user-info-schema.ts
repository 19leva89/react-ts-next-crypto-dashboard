import { z } from 'zod'

const errMsg = {
	email: 'Please enter a valid email address',
	name: 'Enter full name',
	confirmPassword: 'Passwords do not match',
}

export const updateUserInfoSchema = z
	.object({
		email: z.string().trim().email({ message: errMsg.email }),
		name: z.string().trim().min(2, { message: errMsg.name }).optional(),
		password: z
			.string()
			.optional()
			.refine(
				(val) => {
					if (!val) return true // If the password is not specified, validation passes
					return val.length >= 8 // Check the password length
				},
				{ message: 'Password must be at least 8 characters long' },
			)
			.refine(
				(val) => {
					if (!val) return true // If the password is not specified, validation passes
					return /[A-Z]/.test(val) // Check for at least one capital letter
				},
				{ message: 'Password must contain at least one uppercase letter' },
			)
			.refine(
				(val) => {
					if (!val) return true // If the password is not specified, validation passes
					return /[a-z]/.test(val) // Check for at least one lowercase letter
				},
				{ message: 'Password must contain at least one lowercase letter' },
			)
			.refine(
				(val) => {
					if (!val) return true // If the password is not specified, validation passes
					return /\d/.test(val) // Check for the presence of at least one digit
				},
				{ message: 'Password must contain at least one digit' },
			),
		confirmPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.password && data.password !== data.confirmPassword) {
				return false
			}
			return true
		},
		{
			message: errMsg.confirmPassword,
			path: ['confirmPassword'],
		},
	)

export type UserFormValues = z.infer<typeof updateUserInfoSchema>
