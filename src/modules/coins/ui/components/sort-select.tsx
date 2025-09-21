import { useId } from 'react'

import { cn } from '@/lib'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

const SORT_OPTIONS = [
	{ value: 'total-asc', label: 'Total: Low - Hi' },
	{ value: 'total-desc', label: 'Total: Hi - Low' },
	{ value: 'profit-asc', label: 'Profit: Low - Hi' },
	{ value: 'profit-desc', label: 'Profit: Hi - Low' },
	{ value: 'name-asc', label: 'Name: A - Z' },
	{ value: 'name-desc', label: 'Name: Z - A' },
	{ value: 'price-asc', label: 'Price: Low - Hi' },
	{ value: 'price-desc', label: 'Price: Hi - Low' },
] as const

type SortOption = (typeof SORT_OPTIONS)[number]['value']

interface Props {
	value: SortOption
	onChange: (value: SortOption) => void
	className?: string
}

export const SortSelect = ({ value, onChange, className }: Props) => {
	const sortSelectId = useId()

	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger id={sortSelectId} className={cn('w-45 rounded-xl', className)}>
				<SelectValue placeholder='Sort' />
			</SelectTrigger>

			<SelectContent className='w-45 rounded-xl'>
				{SORT_OPTIONS.map(({ value, label }) => (
					<SelectItem key={value} value={value} className='rounded-xl'>
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
