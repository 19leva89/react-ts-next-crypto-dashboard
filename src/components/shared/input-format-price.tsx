'use client'

import { BanknoteIcon } from 'lucide-react'
import { ChangeEvent, useState } from 'react'

import { useFormatValue } from '@/hooks/use-format-value'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui'

interface Props {
	value: number // USD value from DB
	onChange: (value: number) => void // Should return USD value for DB
}

export const InputFormatPrice = ({ value, onChange }: Props) => {
	const formatValue = useFormatValue()
	const { fromUSD, toUSD } = useCurrencyConverter()

	const [isEditing, setIsEditing] = useState<boolean>(false)
	const [displayValue, setDisplayValue] = useState<string>(() => {
		// Convert USD to selected currency for display
		const convertedValue = fromUSD(value)

		return convertedValue.toString()
	})

	const handleFocus = () => {
		setIsEditing(true)

		// Convert USD to selected currency when starting to edit
		const convertedValue = fromUSD(value)
		setDisplayValue(convertedValue.toString())
	}

	const handleBlur = () => {
		setIsEditing(false)
		// Allow numbers with a minus sign and a comma
		let numericValue = parseFloat(displayValue.replace(',', '.').replace(/[^0-9.-]/g, ''))

		// If not a number, return the original value
		if (isNaN(numericValue)) {
			numericValue = 0
		}

		// Convert back to USD before saving to DB
		const usdValue = toUSD(numericValue)
		onChange(usdValue)

		// Update display value with the converted value
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

	// When not editing, show the converted value from USD
	const getDisplayValue = () => {
		if (isEditing) {
			return displayValue
		}

		const convertedValue = fromUSD(value)

		return formatValue(convertedValue)
	}

	return (
		<InputGroup className='h-10 rounded-xl dark:bg-transparent'>
			<InputGroupAddon align='inline-start'>
				<BanknoteIcon className='size-3 sm:size-3.5 lg:size-4' />
			</InputGroupAddon>

			<InputGroupInput
				type='text'
				placeholder='Enter price'
				value={getDisplayValue()}
				onChange={handleChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className='[appearance:textfield] px-2 text-xs sm:text-sm lg:px-3 lg:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
			/>
		</InputGroup>
	)
}
