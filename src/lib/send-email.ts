import nodemailer from 'nodemailer'
import { ReactElement } from 'react'
import { render } from '@react-email/render'

// Get environment variables
const oAuthEmail = process.env.OAUTH_EMAIL || ''
const oAuthClientId = process.env.OAUTH_CLIENT_ID || ''
const oAuthClientSecret = process.env.OAUTH_CLIENT_SECRET || ''
const oAuthRefreshToken = process.env.OAUTH_REFRESH_TOKEN || ''

// Create reusable transporter object using the default SMTP transport
const createTransporter = async () => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				type: 'OAuth2',
				user: oAuthEmail,
				clientId: oAuthClientId,
				clientSecret: oAuthClientSecret,
				refreshToken: oAuthRefreshToken,
			},
			debug: false,
			logger: false,
		})

		// Verify connection configuration
		transporter.verify((error) => {
			if (error) {
				console.error('SMTP connection error:', error)
			} else {
				console.log('SMTP server is ready to send emails')
			}
		})

		return transporter
	} catch (error) {
		console.error('Error creating transporter:', error)

		throw error
	}
}

interface Props {
	to: string
	subject: string
	html: ReactElement
	text?: string
}

export const sendEmail = async (options: Props) => {
	try {
		const transporter = await createTransporter()

		const info = await transporter.sendMail({
			from: `"Crypto Dashboard" <${oAuthEmail}>`,
			to: options.to,
			subject: options.subject,
			html: await render(options.html),
			text: options.text || options.subject, // fallback to subject if no text provided
		})
		console.log('Email sent successfully: %s', info.messageId)
	} catch (error) {
		console.error('ERROR sending email:', error)

		throw error
	}
}
