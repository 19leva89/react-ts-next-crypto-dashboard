interface TradeDownIconProps {
	className?: string
}

export const TradeDownIcon = ({ className }: TradeDownIconProps) => {
	return (
		<div className={className}>
			<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M10 5.5V8H7.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M10 8L7.5 5.5C7.0587 5.0587 6.8381 4.83807 6.5673 4.81368C6.5225 4.80965 6.4775 4.80965 6.4327 4.81368C6.1619 4.83807 5.9413 5.0587 5.5 5.5C5.0587 5.9413 4.83808 6.1619 4.56729 6.1863C4.52252 6.19035 4.47748 6.19035 4.43271 6.1863C4.16192 6.1619 3.94128 5.9413 3.5 5.5L2 4"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	)
}
