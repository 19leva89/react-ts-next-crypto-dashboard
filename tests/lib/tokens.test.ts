import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { getVerificationTokenByEmail } from '@/data/verification-token'
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token'
import { generateTwoFactorToken, generatePasswordResetToken, generateVerificationToken } from '@/lib/tokens'

// Mock the get token functions
vi.mock('@/data/two-factor-token', () => ({
	getTwoFactorTokenByEmail: vi.fn(),
}))

vi.mock('@/data/verification-token', () => ({
	getVerificationTokenByEmail: vi.fn(),
}))

vi.mock('@/data/password-reset-token', () => ({
	getPasswordResetTokenByEmail: vi.fn(),
}))

// Mock crypto for deterministic token generation in two-factor tests
vi.mock('crypto', () => ({
	default: {
		randomInt: vi.fn(),
	},
}))

// Mock UUID for deterministic token generation in password reset and verification tests
vi.mock('uuid', () => ({
	v4: vi.fn(),
}))

// Mock Prisma client methods directly for better typing
vi.mock('@/lib/prisma', () => ({
	prisma: {
		twoFactorToken: {
			create: vi.fn(),
			delete: vi.fn(),
		},
		verificationToken: {
			create: vi.fn(),
			delete: vi.fn(),
		},
		passwordResetToken: {
			create: vi.fn(),
			delete: vi.fn(),
		},
	},
}))

const { prisma } = await import('@/lib/prisma')

describe('Token Generation Functions', () => {
	const testEmail = 'test@example.com'
	const mockUuidValue = 'mock-uuid-v4'
	const mockRandomIntValue = 123456
	const mockExistingToken = {
		id: 'existing-id',
		email: 'test@example.com',
		expires: new Date(),
		token: 'existing-token',
	}

	beforeEach(() => {
		// Reset all mocks before each test
		vi.clearAllMocks()
		vi.mocked(crypto.randomInt).mockImplementation(() => mockRandomIntValue)
		vi.mocked(uuidv4).mockReturnValue(mockUuidValue as unknown as ReturnType<typeof uuidv4>)
	})

	afterEach(() => {
		// Restore original implementations if needed
		vi.restoreAllMocks()
	})

	describe('generateTwoFactorToken', () => {
		it('should generate a 6-digit token and create a new record when no existing token', async () => {
			// Arrange
			vi.mocked(getTwoFactorTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = {
				id: 'new-id',
				email: testEmail,
				token: mockRandomIntValue.toString(),
				expires: new Date(),
			}
			vi.mocked(prisma.twoFactorToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generateTwoFactorToken(testEmail)

			// Assert
			expect(getTwoFactorTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.twoFactorToken.delete)).not.toHaveBeenCalled()
			expect(vi.mocked(prisma.twoFactorToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockRandomIntValue.toString(), // Exact 6-digit string
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should delete existing token and create a new one', async () => {
			// Arrange
			vi.mocked(getTwoFactorTokenByEmail).mockResolvedValue(mockExistingToken)
			const mockCreatedToken = {
				id: 'new-id',
				email: testEmail,
				token: mockRandomIntValue.toString(),
				expires: new Date(),
			}
			vi.mocked(prisma.twoFactorToken.create).mockResolvedValue(mockCreatedToken)
			vi.mocked(prisma.twoFactorToken.delete).mockResolvedValue(mockExistingToken)

			// Act
			const result = await generateTwoFactorToken(testEmail)

			// Assert
			expect(getTwoFactorTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.twoFactorToken.delete)).toHaveBeenCalledWith({
				where: { id: 'existing-id' },
			})
			expect(vi.mocked(prisma.twoFactorToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockRandomIntValue.toString(), // Exact 6-digit string
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should set expires to 5 minutes from now', async () => {
			// Arrange
			vi.mocked(getTwoFactorTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = {
				id: 'new-id',
				email: testEmail,
				token: mockRandomIntValue.toString(),
				expires: new Date(Date.now() + 5 * 60 * 1000),
			}
			vi.mocked(prisma.twoFactorToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generateTwoFactorToken(testEmail)

			// Assert
			const now = new Date()
			const expiresDiff = result.expires.getTime() - now.getTime()
			expect(expiresDiff).toBeGreaterThanOrEqual(5 * 60 * 1000 - 1000) // Allow 1s tolerance
			expect(expiresDiff).toBeLessThanOrEqual(5 * 60 * 1000 + 1000)
		})
	})

	describe('generatePasswordResetToken', () => {
		it('should generate a UUID token and create a new record when no existing token', async () => {
			// Arrange
			vi.mocked(getPasswordResetTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = { id: 'new-id', email: testEmail, token: mockUuidValue, expires: new Date() }
			vi.mocked(prisma.passwordResetToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generatePasswordResetToken(testEmail)

			// Assert
			expect(getPasswordResetTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.passwordResetToken.delete)).not.toHaveBeenCalled()
			expect(vi.mocked(prisma.passwordResetToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockUuidValue,
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should delete existing token and create a new one', async () => {
			// Arrange
			vi.mocked(getPasswordResetTokenByEmail).mockResolvedValue(mockExistingToken)
			const mockCreatedToken = { id: 'new-id', email: testEmail, token: mockUuidValue, expires: new Date() }
			vi.mocked(prisma.passwordResetToken.create).mockResolvedValue(mockCreatedToken)
			vi.mocked(prisma.passwordResetToken.delete).mockResolvedValue(mockExistingToken)

			// Act
			const result = await generatePasswordResetToken(testEmail)

			// Assert
			expect(getPasswordResetTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.passwordResetToken.delete)).toHaveBeenCalledWith({
				where: { id: 'existing-id' },
			})
			expect(vi.mocked(prisma.passwordResetToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockUuidValue,
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should set expires to 1 hour from now', async () => {
			// Arrange
			vi.mocked(getPasswordResetTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = {
				id: 'new-id',
				email: testEmail,
				token: mockUuidValue,
				expires: new Date(Date.now() + 60 * 60 * 1000),
			}
			vi.mocked(prisma.passwordResetToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generatePasswordResetToken(testEmail)

			// Assert (Approximate check with tolerance)
			const now = new Date()
			const expiresDiff = result.expires.getTime() - now.getTime()
			expect(expiresDiff).toBeGreaterThanOrEqual(3600 * 1000 - 1000)
			expect(expiresDiff).toBeLessThanOrEqual(3600 * 1000 + 1000)
		})
	})

	describe('generateVerificationToken', () => {
		it('should generate a UUID token and create a new record when no existing token', async () => {
			// Arrange
			vi.mocked(getVerificationTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = { id: 'new-id', email: testEmail, token: mockUuidValue, expires: new Date() }
			vi.mocked(prisma.verificationToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generateVerificationToken(testEmail)

			// Assert
			expect(getVerificationTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.verificationToken.delete)).not.toHaveBeenCalled()
			expect(vi.mocked(prisma.verificationToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockUuidValue,
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should delete existing token and create a new one', async () => {
			// Arrange
			vi.mocked(getVerificationTokenByEmail).mockResolvedValue(mockExistingToken)
			const mockCreatedToken = { id: 'new-id', email: testEmail, token: mockUuidValue, expires: new Date() }
			vi.mocked(prisma.verificationToken.create).mockResolvedValue(mockCreatedToken)
			vi.mocked(prisma.verificationToken.delete).mockResolvedValue(mockExistingToken)

			// Act
			const result = await generateVerificationToken(testEmail)

			// Assert
			expect(getVerificationTokenByEmail).toHaveBeenCalledWith(testEmail)
			expect(vi.mocked(prisma.verificationToken.delete)).toHaveBeenCalledWith({
				where: { id: 'existing-id' },
			})
			expect(vi.mocked(prisma.verificationToken.create)).toHaveBeenCalledWith({
				data: expect.objectContaining({
					email: testEmail,
					token: mockUuidValue,
					expires: expect.any(Date),
				}),
			})
			expect(result).toEqual(mockCreatedToken)
		})

		it('should set expires to 1 hour from now', async () => {
			// Arrange
			vi.mocked(getVerificationTokenByEmail).mockResolvedValue(null)
			const mockCreatedToken = {
				id: 'new-id',
				email: testEmail,
				token: mockUuidValue,
				expires: new Date(Date.now() + 60 * 60 * 1000),
			}
			vi.mocked(prisma.verificationToken.create).mockResolvedValue(mockCreatedToken)

			// Act
			const result = await generateVerificationToken(testEmail)

			// Assert (Approximate check with tolerance)
			const now = new Date()
			const expiresDiff = result.expires.getTime() - now.getTime()
			expect(expiresDiff).toBeGreaterThanOrEqual(3600 * 1000 - 1000)
			expect(expiresDiff).toBeLessThanOrEqual(3600 * 1000 + 1000)
		})
	})
})
