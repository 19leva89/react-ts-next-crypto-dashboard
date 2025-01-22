import Link from 'next/link'
import { PropsWithChildren } from 'react'

export default function AuthPageLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body>
				{children}
				<div className="text-center text-md my-10">
					<Link href={'https://www.linkedin.com/in/lev-dmitry'} target="_blank">
						Crypto dashboard 2025 by <span className="underline"> Sobolev</span>
					</Link>
				</div>
			</body>
		</html>
	)
}
