export default function ArrowUpIcon({ className }: { className?: string }) {
	return (
		<div className={className}>
			<svg viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M4.25 9L9.5 3.75L14.75 9"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d="M9.5 14.25V3.75"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	)
}
