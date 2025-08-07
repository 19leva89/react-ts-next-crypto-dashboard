import nodemailer from 'nodemailer'

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		type: 'OAuth2',
		user: process.env.EMAIL_FROM,
		clientId: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
	},
})

// Verify connection configuration
transporter.verify((error) => {
	if (error) {
		console.error('SMTP connection error:', error)
	} else {
		console.log('Server is ready to take our messages')
	}
})

interface EmailOptions {
	to: string
	subject: string
	html: string
	text?: string
}

export const sendEmail = async (options: EmailOptions) => {
	try {
		// Send mail with defined transport object
		const info = await transporter.sendMail({
			from: `"Crypto" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`,
			to: options.to,
			subject: options.subject,
			html: options.html,
			text: options.text || options.subject, // fallback to subject if no text provided
		})

		console.log('Message sent: %s', info.messageId)
		return info
	} catch (error) {
		console.error('Error sending email:', error)
		throw error
	}
}
