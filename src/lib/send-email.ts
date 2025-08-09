import nodemailer from 'nodemailer'
import { ReactElement } from 'react'
import { render } from '@react-email/render'

import {
	NotificationPriceTemplate,
	PasswordResetTemplate,
	TwoFactorTokenTemplate,
	VerificationUserTemplate,
} from '@/components/shared/email-templates'

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

const sendEmail = async (options: Props) => {
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

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
	await sendEmail({
		to: email,
		subject: '📝 2FA Code',
		html: TwoFactorTokenTemplate({ token }),
	})
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
	await sendEmail({
		to: email,
		subject: '📝 Reset your password',
		html: PasswordResetTemplate({ token }),
	})
}

export const sendVerificationEmail = async (email: string, token: string) => {
	await sendEmail({
		to: email,
		subject: '📝 Confirm your email',
		html: VerificationUserTemplate({ token }),
	})
}

export const sendNotificationPriceEmail = async (
	email: string,
	coins: {
		name: string
		image: string
		currentPrice: number
		desiredPrice: number
	}[],
) => {
	await sendEmail({
		to: email,
		subject: `🚀 ${coins.length > 1 ? 'A few coins' : coins[0].name} reached your target`,
		html: NotificationPriceTemplate({ coins }),
	})
}
