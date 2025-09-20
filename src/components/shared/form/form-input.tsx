'use client'

import { useFormContext } from 'react-hook-form'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { InputHTMLAttributes, useState } from 'react'

import { Input } from '@/components/ui'
import { ClearButton, ErrorText, RequiredSymbol } from '@/components/shared'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	name: string
	label?: string
	type: string
	placeholder?: string
	required?: boolean
	className?: string
}

export const FormInput = ({ className, name, label, type, placeholder, required, ...props }: Props) => {
	const {
		register,
		formState: { errors },
		watch,
		setValue,
	} = useFormContext()
	const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)

	const value = watch(name)
	const errorText = errors[name]?.message as string

	const onClickClear = () => {
		setValue(name, '')
	}

	const togglePasswordVisibility = () => {
		setIsPasswordVisible((prev) => !prev)
	}

	return (
		<div className={className}>
			{label && (
				<p className='mb-2 font-medium'>
					{label} {required && <RequiredSymbol />}
				</p>
			)}

			<div className='relative'>
				<Input
					type={type === 'password' && !isPasswordVisible ? 'password' : 'text'}
					placeholder={placeholder}
					className='h-11 rounded-xl pr-20 text-base'
					{...register(name)}
					{...props}
				/>

				{type === 'password' && (
					<button
						type='button'
						onClick={togglePasswordVisibility}
						className='absolute top-1/2 right-4 -translate-y-1/2 transform cursor-pointer opacity-30 transition-opacity duration-300 ease-in-out hover:opacity-100'
					>
						{isPasswordVisible ? <EyeOffIcon className='size-5' /> : <EyeIcon className='size-5' />}
					</button>
				)}

				{value && type !== 'password' && <ClearButton onClick={onClickClear} />}
			</div>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
