'use server'

import { hashSync } from 'bcrypt'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import { sendEmail } from '@/lib/send-email'
import { getUserSession } from '@/lib/get-user-session'
import { VerificationUserTemplate } from '@/components/shared/email-temapltes'

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
	try {
		const currentUser = await getUserSession()

		if (!currentUser) {
			throw new Error('User not found')
		}

		const existingUser = await prisma.user.findFirst({
			where: {
				id: Number(currentUser.id),
			},
		})

		if (!existingUser) {
			throw new Error('User not found')
		}

		// Validation for email uniqueness
		if (body.email && body.email !== existingUser.email) {
			const emailExists = await prisma.user.findUnique({
				where: {
					email: body.email as string,
				},
			})
			if (emailExists) {
				throw new Error('Email is already in use')
			}
		}

		const updatedData: Prisma.UserUpdateInput = {
			fullName: body.fullName,
			email: body.email ? body.email : existingUser.email, // Conditional assignment
			password: body.password ? hashSync(body.password as string, 10) : existingUser.password,
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: Number(currentUser.id),
			},
			data: updatedData,
		})

		return updatedUser
	} catch (err) {
		console.log('Error [UPDATE_USER]', err)
		throw err
	}
}

export async function registerUser(body: Prisma.UserCreateInput) {
	try {
		const user = await prisma.user.findFirst({
			where: {
				email: body.email,
			},
		})

		if (user) {
			if (!user.verified) {
				throw new Error('Email not confirmed')
			}

			throw new Error('User already exists')
		}

		const createdUser = await prisma.user.create({
			data: {
				fullName: body.fullName,
				email: body.email,
				password: hashSync(body.password, 10),
			},
		})

		const code = Math.floor(100000 + Math.random() * 900000).toString()

		await prisma.verificationCode.create({
			data: {
				code,
				userId: createdUser.id,
			},
		})

		await sendEmail(
			createdUser.email,
			'Crypto / 📝 Registration confirmation',
			VerificationUserTemplate({
				code,
			}),
		)
	} catch (err) {
		console.log('Error [CREATE_USER]', err)
		throw err
	}
}
