interface SearchIconProps {
	className?: string
}

export const SearchIcon = ({ className }: SearchIconProps) => {
	return (
		<div className={className}>
			<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clipPath="url(#clip0_5216_5293)">
					<path
						d="M13.1247 13.1247L16.4997 16.4997"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M15.0003 8.25031C15.0003 4.52239 11.9782 1.50031 8.25029 1.50031C4.52237 1.50031 1.50029 4.52239 1.50029 8.25031C1.50029 11.9783 4.52237 15.0003 8.25029 15.0003C11.9782 15.0003 15.0003 11.9783 15.0003 8.25031Z"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinejoin="round"
					/>
				</g>
				<defs>
					<clipPath id="clip0_5216_5293">
						<rect width="18" height="18" fill="white" />
					</clipPath>
				</defs>
			</svg>
		</div>
	)
}
