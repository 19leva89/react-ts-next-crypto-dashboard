import { genSalt, hash } from 'bcrypt-ts'

export const saltAndHashPassword = async (password: string) => {
	const saltRounds = 12 // Adjust the cost factor according to your security requirements
	const salt = await genSalt(saltRounds) // Async generate a salt
	const hashStr = await hash(password, salt) // Async hash the password

	return hashStr // Return the hash directly as a string
}
