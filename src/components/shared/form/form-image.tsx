'use client'

import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import { XIcon, ImageIcon, UploadIcon } from 'lucide-react'
import { DragEvent, InputHTMLAttributes, useState, useCallback, ChangeEvent } from 'react'

import { cn } from '@/lib'
import { Input } from '@/components/ui'
import { ErrorText, RequiredSymbol } from '@/components/shared'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
	name: string
	label?: string
	placeholder?: string
	required?: boolean
	className?: string
	accept?: string
	maxSize?: number // in bytes
	onFileChange?: (file: File | null) => void
}

export const FormImage = ({
	className,
	name,
	label,
	placeholder,
	required,
	accept = 'image/*',
	maxSize = 5 * 1024 * 1024, // 5MB
	onFileChange,
	disabled,
	...props
}: Props) => {
	const {
		register,
		formState: { errors },
		setValue,
		setError,
		clearErrors,
	} = useFormContext()

	const [preview, setPreview] = useState<string | null>(null)
	const [isDragOver, setIsDragOver] = useState<boolean>(false)

	const errorText = errors[name]?.message as string

	const validateFile = useCallback(
		(file: File): boolean => {
			// Check file type
			if (!file.type.startsWith('image/')) {
				setError(name, { message: 'The file must be an image' })

				return false
			}

			// Check file size
			if (file.size > maxSize) {
				const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
				setError(name, { message: 'The image size must be less than ' + maxSizeMB + 'MB' })

				return false
			}

			clearErrors(name)

			return true
		},

		[name, maxSize, setError, clearErrors],
	)

	const handleFileChange = useCallback(
		(file: File | null) => {
			if (file && !validateFile(file)) {
				return
			}

			setValue(name, file)
			onFileChange?.(file)

			if (file) {
				const reader = new FileReader()

				reader.onload = (e) => {
					setPreview(e.target?.result as string)
				}

				reader.readAsDataURL(file)
			} else {
				setPreview(null)
			}
		},

		[name, setValue, onFileChange, validateFile],
	)

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null

		handleFileChange(file)
	}

	const onClickClear = () => {
		setValue(name, null)
		setPreview(null)
		onFileChange?.(null)
		clearErrors(name)

		// Clear the file input
		const input = document.querySelector(`input[name="${name}"]`) as HTMLInputElement
		if (input) {
			input.value = ''
		}
	}

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		setIsDragOver(true)
	}

	const handleDragLeave = (e: DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)
	}

	const handleDrop = (e: DragEvent) => {
		e.preventDefault()
		setIsDragOver(false)

		if (disabled) return

		const file = e.dataTransfer.files?.[0] ?? null
		if (file) {
			handleFileChange(file)
		}
	}

	return (
		<div className={className}>
			{label && (
				<p className='mb-2 font-medium'>
					{label} {required && <RequiredSymbol />}
				</p>
			)}

			<div className='space-y-3'>
				{/* Drag & Drop zone */}
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() => {
						if (!disabled) {
							document.getElementById(`file-input-${name}`)?.click()
						}
					}}
					className={cn(
						'relative rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-300 ease-in-out',
						isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300',
						disabled
							? 'cursor-not-allowed opacity-50'
							: 'cursor-pointer hover:border-primary hover:bg-gray-50',
					)}
				>
					<Input
						id={`file-input-${name}`}
						type='file'
						accept={accept}
						disabled={disabled}
						className='hidden'
						{...register(name, {
							onChange: onInputChange,
						})}
						{...props}
					/>

					{preview ? (
						<div className='relative'>
							<Image
								src={preview}
								alt='Preview'
								width={128}
								height={128}
								className='mx-auto max-h-32 max-w-full rounded object-cover'
								unoptimized
							/>

							<button
								type='button'
								onClick={(e) => {
									e.stopPropagation()
									onClickClear()
								}}
								disabled={disabled}
								className='absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600'
							>
								<XIcon className='size-4' />
							</button>
						</div>
					) : (
						<div className='space-y-2'>
							<div className='mx-auto size-12 text-gray-400'>
								<ImageIcon className='size-full' />
							</div>

							<div className='space-y-1'>
								<p className='text-sm font-medium'>{placeholder}</p>

								<p className='text-xs text-gray-500'>
									{'Supported formats: JPG, PNG, GIF (max. ' + (maxSize / (1024 * 1024)).toFixed(0) + ' MB)'}
								</p>
							</div>

							<UploadIcon className='mx-auto size-6 text-gray-400' />
						</div>
					)}
				</div>

				{/* Hidden input for form submission */}
				<Input type='hidden' {...register(name)} />
			</div>

			{errorText && <ErrorText text={errorText} className='mt-2 ml-4' />}
		</div>
	)
}
