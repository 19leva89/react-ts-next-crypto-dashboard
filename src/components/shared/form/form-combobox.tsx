'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui'
import { cn } from '@/lib'
import { ErrorText } from '@/components/shared'

interface Item {
	id: number
	name: string
	communityId?: number
}

interface Props {
	name: string
	placeholder: string
	noResultsText: string
	selectPlaceholder: string
	mapTable: Item[]
	onSelect?: (item: Item) => void
	className?: string
}

export function FormCombobox({
	name,
	placeholder,
	noResultsText,
	selectPlaceholder,
	mapTable,
	onSelect,
	className,
}: Props) {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = useFormContext()
	const [open, setOpen] = useState<boolean>(false)

	const value = watch(name)
	const errorText = errors[name]?.message as string

	const selectedItem = mapTable.find((item) => item.name === value)

	const handleSelect = (currentValue: number) => {
		const selectedItem = mapTable.find((item) => item.id === currentValue)

		if (selectedItem) {
			setValue(name, selectedItem.name, { shouldValidate: true })

			if (onSelect) {
				onSelect(selectedItem)
			}
		}

		setOpen(false)
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<div>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						onClick={() => setOpen(true)}
						className={cn('border-[#e5e7eb] text-[#78716c] hover:bg-transparent', className)}
						{...register(name)}
					>
						{selectedItem ? selectedItem.name : placeholder}

						<ChevronsUpDownIcon className='ml-2 size-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>

				{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
			</div>

			<PopoverContent className='w-50 p-0'>
				<Command>
					<CommandInput placeholder={selectPlaceholder} name={name} />

					<CommandList>
						<CommandEmpty>{noResultsText}</CommandEmpty>

						<CommandGroup>
							{mapTable.map((item) => (
								<CommandItem key={item.id} value={item.name} onSelect={() => handleSelect(item.id)}>
									<CheckIcon
										className={cn('mr-2 size-4', value === item.name ? 'opacity-100' : 'opacity-0')}
									/>
									{item.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
