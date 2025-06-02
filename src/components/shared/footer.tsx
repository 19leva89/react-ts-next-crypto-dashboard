import Link from 'next/link'

export const Footer = () => {
	return (
		<div className='text-md mt-10 mb-3 text-center'>
			<Link href='https://www.linkedin.com/in/lev-dmitry' target='_blank no-referrer'>
				Crypto dashboard 2025 by <span className='underline'> Sobolev</span>
			</Link>
		</div>
	)
}
