'use client'

import { useFormContext } from 'react-hook-form'

import { cn } from '@/lib'
import { Switch } from '@/components/ui'
import { ErrorText, RequiredSymbol } from '@/components/shared'

interface Props {
	name: string
	label?: string
	description?: string
	required?: boolean
	className?: string
	disabled?: boolean
}

export const FormSwitch = ({
	className,
	name,
	label,
	description,
	required,
	disabled = false,
	...props
}: Props) => {
	const {
		formState: { errors },
		watch,
		setValue,
		trigger,
	} = useFormContext()

	const value = watch(name) as boolean
	const errorText = errors[name]?.message as string

	const handleChange = async (checked: boolean) => {
		setValue(name, checked, { shouldValidate: true })
		await trigger(name)
	}

	return (
		<div className={cn('space-y-2', className)}>
			<div className='flex items-center gap-5 rounded-md border border-input p-3 shadow-xs'>
				<Switch
					id={name}
					checked={value || false}
					onCheckedChange={handleChange}
					disabled={disabled}
					className={cn(errorText && 'border-red-500')}
					{...props}
				/>

				<div className='flex flex-col gap-1'>
					{label && (
						<label
							htmlFor={name}
							className={cn(
								'cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
								disabled && 'cursor-not-allowed opacity-70',
							)}
						>
							{label} {required && <RequiredSymbol />}
						</label>
					)}

					{description && <p className='text-sm text-muted-foreground'>{description}</p>}
				</div>
			</div>

			{errorText && <ErrorText text={errorText} className='ml-4' />}
		</div>
	)
}
