import nodemailer from 'nodemailer'
import { ReactElement } from 'react'
import { render } from '@react-email/render'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
	sendTwoFactorTokenEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
	sendNotificationPriceEmail,
} from '@/lib/send-email'

// Mock nodemailer partially
vi.mock('nodemailer', async (importOriginal: () => Promise<nodemailer.Transporter>) => {
	const actual = await importOriginal()

	return Object.assign({}, actual, {
		_defaults: Object.assign({}, actual._defaults, {
			createTransport: vi.fn(),
		}),
	})
})

// Mock React Email render function
vi.mock('@react-email/render', () => ({
	render: vi.fn(),
}))

// Helper to create a mock React element
const createMockElement = (content: string): ReactElement =>
	({
		type: 'div',
		props: { children: content },
		key: null,
	}) as ReactElement

// Mock email template components
vi.mock('@/components/shared/email-templates', () => ({
	TwoFactorTokenTemplate: vi.fn((props) =>
		createMockElement(`Mock TwoFactorTokenTemplate ${JSON.stringify(props)}`),
	),
	PasswordResetTemplate: vi.fn((props) =>
		createMockElement(`Mock PasswordResetTemplate ${JSON.stringify(props)}`),
	),
	VerificationUserTemplate: vi.fn((props) =>
		createMockElement(`Mock VerificationUserTemplate ${JSON.stringify(props)}`),
	),
	NotificationPriceTemplate: vi.fn((props) =>
		createMockElement(`Mock NotificationPriceTemplate ${JSON.stringify(props)}`),
	),
}))

describe('Email Sending Functions', () => {
	let mockTransporter: any

	beforeEach(() => {
		vi.clearAllMocks()

		// Mock console to suppress logs from the lib
		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})

		// Mock render to return static HTML
		vi.mocked(render).mockResolvedValue('<mock-html>')

		// Mock transporter
		mockTransporter = {
			sendMail: vi.fn().mockResolvedValue({ messageId: 'mock-message-id' }),
			verify: vi.fn((callback: (error?: Error) => void) => callback(undefined)),
		}

		// Spy on createTransport
		vi.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter as any)
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('sendTwoFactorTokenEmail', () => {
		it('should send a two-factor token email with correct parameters', async () => {
			// Arrange
			const email = 'test@example.com'
			const token = '123456'

			// Act
			await sendTwoFactorTokenEmail(email, token)

			// Assert
			// Verify template was rendered with correct props
			expect(render).toHaveBeenCalled()

			// Verify sendMail was called with expected email details
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: expect.stringContaining('Crypto Dashboard'),
				to: email,
				subject: '📝 2FA Code',
				html: '<mock-html>',
				text: '📝 2FA Code',
			})
		})
	})

	describe('sendPasswordResetEmail', () => {
		it('should send a password reset email with correct parameters', async () => {
			// Arrange
			const email = 'test@example.com'
			const token = 'reset-token-uuid'

			// Act
			await sendPasswordResetEmail(email, token)

			// Assert
			// Verify template was rendered with correct props
			expect(render).toHaveBeenCalled()

			// Verify sendMail was called with expected email details
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: expect.stringContaining('Crypto Dashboard'),
				to: email,
				subject: '📝 Reset your password',
				html: '<mock-html>',
				text: '📝 Reset your password',
			})
		})
	})

	describe('sendVerificationEmail', () => {
		it('should send a verification email with correct parameters', async () => {
			// Arrange
			const email = 'test@example.com'
			const token = 'verification-token-uuid'

			// Act
			await sendVerificationEmail(email, token)

			// Assert
			// Verify template was rendered with correct props
			expect(render).toHaveBeenCalled()

			// Verify sendMail was called with expected email details
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: expect.stringContaining('Crypto Dashboard'),
				to: email,
				subject: '📝 Confirm your email',
				html: '<mock-html>',
				text: '📝 Confirm your email',
			})
		})
	})

	describe('sendNotificationPriceEmail', () => {
		it('should send a price notification email with correct parameters for a single coin', async () => {
			// Arrange
			const email = 'test@example.com'
			const coins = [
				{
					name: 'Bitcoin',
					image: 'btc.png',
					currentPrice: 50000,
					desiredPrice: 45000,
				},
			]

			// Act
			await sendNotificationPriceEmail(email, coins)

			// Assert
			// Verify template was rendered with correct props
			expect(render).toHaveBeenCalled()

			// Verify sendMail was called with expected email details
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: expect.stringContaining('Crypto Dashboard'),
				to: email,
				subject: '🚀 Bitcoin reached your target',
				html: '<mock-html>',
				text: '🚀 Bitcoin reached your target',
			})
		})

		it('should send a price notification email with correct parameters for multiple coins', async () => {
			// Arrange
			const email = 'test@example.com'
			const coins = [
				{
					name: 'Bitcoin',
					image: 'btc.png',
					currentPrice: 50000,
					desiredPrice: 45000,
				},
				{
					name: 'Ethereum',
					image: 'eth.png',
					currentPrice: 3000,
					desiredPrice: 2800,
				},
			]

			// Act
			await sendNotificationPriceEmail(email, coins)

			// Assert
			// Verify template was rendered with correct props
			expect(render).toHaveBeenCalled()

			// Verify sendMail was called with expected email details
			expect(mockTransporter.sendMail).toHaveBeenCalledWith({
				from: expect.stringContaining('Crypto Dashboard'),
				to: email,
				subject: '🚀 A few coins reached your target',
				html: '<mock-html>',
				text: '🚀 A few coins reached your target',
			})
		})
	})
})
