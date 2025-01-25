import { cn } from '@/lib'

interface Props {
	text: string
	className?: string
}

export const ErrorText = ({ text, className }: Props) => {
	return <p className={cn('text-red-500 text-sm', className)}>{text}</p>
}
