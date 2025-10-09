'use client'

import { TextareaHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import { ClearButton, RequiredSymbol } from '@/components/shared'
import { Field, FieldContent, FieldError, FieldLabel, Textarea } from '@/components/ui'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	name: string
	label?: string
	required?: boolean
	className?: string
}

export const FormTextarea = ({ className, name, label, required, ...props }: Props) => {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = useFormContext()

	const value = watch(name)
	const errorText = errors[name]?.message as string

	const onClickClear = () => {
		setValue(name, '')
	}

	return (
		<Field className={className}>
			{label && (
				<FieldLabel htmlFor={name}>
					{label} {required && <RequiredSymbol />}
				</FieldLabel>
			)}

			<FieldContent>
				<div className='relative'>
					<Textarea id={name} className='h-11 text-base' {...register(name)} {...props} />

					{value && <ClearButton onClick={onClickClear} />}
				</div>
			</FieldContent>

			{errorText && <FieldError>{errorText}</FieldError>}
		</Field>
	)
}
