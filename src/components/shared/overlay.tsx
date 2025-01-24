import { cn } from '@/lib'

interface OverlayProps {
	showOverlay: boolean
	onOverlayClick: () => void
}

export const Overlay = ({ showOverlay, onOverlayClick }: OverlayProps) => {
	return (
		<div
			onClick={onOverlayClick}
			className={cn(
				'fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] dark:bg-slate-50 dark:opacity-30 z-[9]',
				showOverlay ? 'block' : 'hidden',
			)}
		/>
	)
}
