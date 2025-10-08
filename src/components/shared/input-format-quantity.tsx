'use client'

import { ActivityIcon } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'

import { useFormatValue } from '@/hooks/use-format-value'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui'

interface Props {
	value: number
	onChange: (value: number) => void
}

export const InputFormatQuantity = ({ value, onChange }: Props) => {
	const formatValue = useFormatValue()

	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [internalValue, setInternalValue] = useState<number>(value)
	const [displayValue, setDisplayValue] = useState<string>(value.toString())

	const handleFocus = () => {
		setIsEditing(true)
		setDisplayValue(internalValue.toString())
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
		setInternalValue(numericValue)
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

	// Sync displayValue with value when not editing
	useEffect(() => {
		if (!isEditing) {
			setDisplayValue(value.toString())

			setInternalValue(value)
		}
	}, [value, isEditing])

	return (
		<InputGroup className='h-10 rounded-xl hover:bg-accent dark:bg-transparent'>
			<InputGroupAddon align='inline-start'>
				<ActivityIcon className='size-3 sm:size-3.5 lg:size-4' />
			</InputGroupAddon>

			<InputGroupInput
				type='text'
				placeholder='Enter quantity'
				value={getDisplayValue()}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className='[appearance:textfield] px-2 text-xs sm:text-sm lg:px-3 lg:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
			/>
		</InputGroup>
	)
}
