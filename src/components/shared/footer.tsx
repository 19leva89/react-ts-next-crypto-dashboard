import Link from 'next/link'

export const Footer = () => {
	return (
		<div data-testid='footer' className='mt-10 mb-3 text-center text-xs sm:text-sm md:text-base'>
			<Link
				data-testid='footer-link'
				href='https://www.linkedin.com/in/lev-dmitry'
				target='_blank'
				rel='noopener noreferrer'
			>
				Crypto dashboard 2025-2026 by <span className='underline'> Sobolev</span>
			</Link>
		</div>
	)
}
