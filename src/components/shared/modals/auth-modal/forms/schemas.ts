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
export const LoginSchema = z.object({
	email: z.email({ message: errMsg.email }),
	password: passwordSchema,
	code: z.optional(z.string()),
	rememberMe: z.boolean(),
})

// Scheme for registration
export const RegisterSchema = LoginSchema.omit({ rememberMe: true })
	.extend({
		name: z.string().min(2, { message: errMsg.name }),
		confirmPassword: passwordSchema,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: errMsg.confirmPassword,
		path: ['confirmPassword'],
	})

export const NewPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: errMsg.confirmPassword,
		path: ['confirmPassword'],
	})

export const ResetSchema = z.object({
	email: z.email({
		message: 'Email is required',
	}),
})

export type TLoginValues = z.infer<typeof LoginSchema>
export type TRegisterValues = z.infer<typeof RegisterSchema>
export type TNewPasswordValues = z.infer<typeof NewPasswordSchema>
export type TResetValues = z.infer<typeof ResetSchema>
