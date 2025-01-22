import Image from 'next/image'

interface LogoProps {
	className?: string
}

export const Logo = ({ className }: LogoProps) => {
	return (
		<div className={className}>
			<img alt="Crypto" src="/img/logo.png" />
		</div>
	)
}
