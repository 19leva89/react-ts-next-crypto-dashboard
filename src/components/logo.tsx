import Image from 'next/image'

interface LogoProps {
	className?: string
}

export const Logo = ({ className }: LogoProps) => {
	return (
		<div className={className}>
			<Image alt="Crypto logo" src="/svg/logo.svg" width={223} height={50} priority />
		</div>
	)
}
