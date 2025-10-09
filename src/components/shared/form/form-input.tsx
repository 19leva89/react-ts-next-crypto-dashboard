'use client'

import { useFormContext } from 'react-hook-form'
import { InputHTMLAttributes, useState } from 'react'
import { DeleteIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

import {
	Field,
	FieldContent,
	FieldError,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui'
import { RequiredSymbol } from '@/components/shared'

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
		<Field className={className}>
			{label && (
				<FieldLabel>
					{label} {required && <RequiredSymbol />}
				</FieldLabel>
			)}

			<FieldContent>
				<InputGroup className='h-11 overflow-hidden rounded-xl dark:bg-transparent'>
					<InputGroupInput
						type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
						placeholder={placeholder}
						{...register(name)}
						{...rest}
					/>

					<InputGroupAddon align='inline-end'>
						{type === 'password' && (
							<Tooltip>
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
							</Tooltip>
						)}

						{value && type !== 'password' && (
							<Tooltip>
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
							</Tooltip>
						)}
					</InputGroupAddon>
				</InputGroup>
			</FieldContent>

			{errorText && <FieldError>{errorText}</FieldError>}
		</Field>
	)
}
