'use client'

import { useFormContext } from 'react-hook-form'
import { InputHTMLAttributes, useState } from 'react'
import { DeleteIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { ErrorText, RequiredSymbol } from '@/components/shared'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	name: string
	label?: string
	type: string
	placeholder?: string
	required?: boolean
	className?: string
}

export const FormInput = ({ className, name, label, type, placeholder, required, ...rest }: Props) => {
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

			<InputGroup className='input-group h-11 overflow-hidden rounded-xl dark:bg-transparent'>
				<InputGroupInput
					type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
					placeholder={placeholder}
					{...register(name)}
					{...rest}
				/>

				<InputGroupAddon align='inline-end'>
					<Tooltip>
						{type === 'password' && (
							<>
								<TooltipTrigger asChild>
									<InputGroupButton
										variant='ghost'
										size='icon-sm'
										onClick={togglePasswordVisibility}
										className='opacity-30 transition-opacity duration-300 ease-in-out hover:bg-transparent hover:opacity-100'
									>
										{isPasswordVisible ? <EyeOffIcon className='size-5' /> : <EyeIcon className='size-5' />}
									</InputGroupButton>
								</TooltipTrigger>

								<TooltipContent className='rounded-xl text-white'>
									{isPasswordVisible ? 'Hide password' : 'Show password'}
								</TooltipContent>
							</>
						)}

						{value && type !== 'password' && (
							<>
								<TooltipTrigger asChild>
									<InputGroupButton
										variant='ghost'
										size='icon-sm'
										onClick={onClickClear}
										className='opacity-30 transition-opacity duration-300 ease-in-out hover:bg-transparent hover:opacity-100'
									>
										<DeleteIcon className='size-5' />
									</InputGroupButton>
								</TooltipTrigger>

								<TooltipContent className='rounded-xl text-white'>
									<p>Clear</p>
								</TooltipContent>
							</>
						)}
					</Tooltip>
				</InputGroupAddon>
			</InputGroup>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
