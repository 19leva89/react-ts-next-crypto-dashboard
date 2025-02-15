'use client'

import { useState } from 'react'

import { Input } from '@/components/ui'

interface Props {
	value: number
	onChange: (value: number) => void
}

export const InputFormatPrice = ({ value, onChange }: Props) => {
	const [isEditing, setIsEditing] = useState(false)
	const [displayValue, setDisplayValue] = useState(value.toString())

	const handleFocus = () => {
		setIsEditing(true)
		setDisplayValue(value.toString())
	}

	const handleBlur = () => {
		setIsEditing(false)
		// Разрешаем числа с минусом и запятой
		let numericValue = parseFloat(displayValue.replace(',', '.').replace(/[^0-9.-]/g, ''))

		// Если не число, возвращаем исходное значение
		if (isNaN(numericValue)) {
			numericValue = 0
		}

		onChange(numericValue)
		setDisplayValue(numericValue.toString())
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value

		// Разрешаем минус только в начале
		if (newValue.includes('-') && newValue.indexOf('-') !== 0) {
			newValue = newValue.replace(/-/g, '') // Удаляем лишние минусы
		}

		setDisplayValue(newValue)
	}

	return (
		<Input
			type="text"
			value={isEditing ? displayValue : value}
			onChange={handleChange}
			onBlur={handleBlur}
			onFocus={handleFocus}
			className="rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
		/>
	)
}
