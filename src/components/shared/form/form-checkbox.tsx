'use client'

import { useFormContext, Controller } from 'react-hook-form'

import { cn } from '@/lib'
import { Checkbox, Label } from '@/components/ui'
import { ErrorText, RequiredSymbol } from '@/components/shared'

interface Props {
	name: string
	label: string
	required?: boolean
	disabled?: boolean
	className?: string
}

export const FormCheckbox = ({ name, label, required = false, disabled = false, className }: Props) => {
	const {
		control,
		formState: { errors },
	} = useFormContext()

	const errorText = errors[name]?.message as string

	return (
		<div className={cn('space-y-2', className)}>
			<Controller
				name={name}
				control={control}
				rules={{ required }}
				render={({ field }) => (
					<div className='flex items-center gap-2'>
						<Checkbox
							id={name}
							disabled={disabled}
							checked={!!field.value}
							onCheckedChange={(val) => field.onChange(val === true)}
							className={cn(
								'size-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary',
								errorText && 'border-red-500 text-red-600 focus:ring-red-500',
							)}
						/>

						<Label htmlFor={name} className='cursor-pointer text-sm font-medium text-gray-700'>
							{label} {required && <RequiredSymbol />}
						</Label>
					</div>
				)}
			/>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
