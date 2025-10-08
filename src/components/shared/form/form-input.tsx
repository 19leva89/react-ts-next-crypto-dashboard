'use client'

import { useFormContext } from 'react-hook-form'
import { InputHTMLAttributes, useState } from 'react'
import { DeleteIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import { ErrorText, RequiredSymbol } from '@/components/shared'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	name: string
	label?: string
	type: string
	placeholder?: string
	required?: boolean
	className?: string
}

export const FormInput = ({ className, name, label, type, placeholder, required }: Props) => {
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

			<InputGroup className='h-11 overflow-hidden rounded-xl dark:bg-transparent'>
				<InputGroupInput
					type={type === 'password' && !isPasswordVisible ? 'password' : 'text'}
					placeholder={placeholder}
					{...register(name)}
				/>

				<InputGroupAddon align='inline-end'>
					{type === 'password' && (
						<InputGroupButton
							variant='ghost'
							size='icon-sm'
							onClick={togglePasswordVisibility}
							className='opacity-30 transition-opacity duration-300 ease-in-out hover:bg-transparent hover:opacity-100'
						>
							{isPasswordVisible ? <EyeOffIcon className='size-5' /> : <EyeIcon className='size-5' />}
						</InputGroupButton>
					)}

					{value && type !== 'password' && (
						<InputGroupButton
							variant='ghost'
							size='icon-sm'
							onClick={onClickClear}
							className='opacity-30 transition-opacity duration-300 ease-in-out hover:bg-transparent hover:opacity-100'
						>
							<DeleteIcon className='size-5' />
						</InputGroupButton>
					)}
				</InputGroupAddon>
			</InputGroup>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
