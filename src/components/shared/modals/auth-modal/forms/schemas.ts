import { z } from 'zod'

const errMsg = {
	email: 'Please enter a valid email address',
	name: 'Enter your first and last name',
	confirmPassword: 'Passwords do not match',
}

// Scheme for password
const passwordSchema = z
	.string()
	.min(8, { message: 'Password must be at least 8 characters long' })
	.regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
	.regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
	.regex(/\d/, { message: 'Password must contain at least one digit' })

// Scheme for login
export const formLoginSchema = z.object({
	email: z.string().email({ message: errMsg.email }),
	password: passwordSchema,
})

// Scheme for registration
export const formRegisterSchema = formLoginSchema
	.extend({
		name: z.string().min(2, { message: errMsg.name }),
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: errMsg.confirmPassword,
		path: ['confirmPassword'],
	})

export type TFormLoginValues = z.infer<typeof formLoginSchema>
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>
