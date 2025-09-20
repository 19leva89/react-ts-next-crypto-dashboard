'use client'

import { ChangeEvent, useState } from 'react'

import { Input } from '@/components/ui'
import { useFormatValue } from '@/hooks/use-format-value'

interface Props {
	value: number
	onChange: (value: number) => void
}

export const InputFormatQuantity = ({ value, onChange }: Props) => {
	const formatValue = useFormatValue()

	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [displayValue, setDisplayValue] = useState<string>(value.toString())

	const handleFocus = () => {
		setIsEditing(true)
		setDisplayValue(value.toString())
	}

	const handleBlur = () => {
		setIsEditing(false)
		// Allow numbers with a minus sign and a comma
		let numericValue = parseFloat(displayValue.replace(',', '.').replace(/[^0-9.-]/g, ''))

		// If not a number, return the original value
		if (isNaN(numericValue)) {
			numericValue = 0
		}

		onChange(numericValue)
		setDisplayValue(numericValue.toString())
	}

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		let newValue = e.target.value

		// Allow minus only at the beginning
		if (newValue.includes('-') && newValue.indexOf('-') !== 0) {
			newValue = newValue.replace(/-/g, '') // Remove unnecessary minuses
		}

		setDisplayValue(newValue)
	}

	// When not editing, show the value
	const getDisplayValue = () => {
		if (isEditing) {
			return displayValue
		}

		return formatValue(value)
	}

	return (
		<Input
			type='text'
			value={getDisplayValue()}
			onChange={handleChange}
			onBlur={handleBlur}
			onFocus={handleFocus}
			className='[appearance:textfield] rounded-xl px-2 text-xs sm:text-sm lg:px-3 lg:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
		/>
	)
}
