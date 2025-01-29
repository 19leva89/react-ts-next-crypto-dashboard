import bcrypt from 'bcryptjs'

export const saltAndHashPassword = async (password: string) => {
	const saltRounds = 12 // Adjust the cost factor according to your security requirements
	const salt = await bcrypt.genSalt(saltRounds) // Async generate a salt
	const hash = await bcrypt.hash(password, salt) // Async hash the password

	return hash // Return the hash directly as a string
}
