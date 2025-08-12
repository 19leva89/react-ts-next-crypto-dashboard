'use client'

import { TextareaHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'

import { Textarea } from '@/components/ui'
import { ClearButton, ErrorText, RequiredSymbol } from '@/components/shared'

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
		<div className={className}>
			<p className='mb-2 font-medium'>
				{label} {required && <RequiredSymbol />}
			</p>

			<div className='relative'>
				<Textarea className='text-md h-11' {...register(name)} {...props} />

				{value && <ClearButton onClick={onClickClear} />}
			</div>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
