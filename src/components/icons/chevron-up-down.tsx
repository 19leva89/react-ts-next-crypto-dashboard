interface ChevronUpDownIconProps {
	className?: string
}

export const ChevronUpDownIcon = ({ className }: ChevronUpDownIconProps) => {
	return (
		<div className={className}>
			<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M4.6665 10L7.99984 13.3333L11.3332 10"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M4.6665 6.00001L7.99984 2.66667L11.3332 6.00001"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	)
}
