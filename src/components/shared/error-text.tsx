import { cn } from '@/lib'

interface Props {
	text: string
	className?: string
}

export const ErrorText = ({ text, className }: Props) => {
	return (
		<p data-testid='error-text' className={cn('text-sm text-red-500', className)}>
			{text}
		</p>
	)
}
