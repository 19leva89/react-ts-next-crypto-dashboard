'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
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
				<p className="font-medium mb-2">
					{label} {required && <RequiredSymbol />}
				</p>
			)}

			<div className="relative">
				<Input
					className="h-12 text-md pr-20 rounded-xl"
					type={type === 'password' && !isPasswordVisible ? 'password' : 'text'}
					placeholder={placeholder}
					{...register(name)}
					{...props}
				/>

				{type === 'password' && (
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30 hover:opacity-100 cursor-pointer"
					>
						{isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
					</button>
				)}

				{value && type !== 'password' && <ClearButton onClick={onClickClear} />}
			</div>

			{errorText && <ErrorText text={errorText} className="mt-2 ml-4" />}
		</div>
	)
}
