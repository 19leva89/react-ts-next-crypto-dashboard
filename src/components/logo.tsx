import Image from 'next/image'

interface LogoProps {
	className?: string
}

export const Logo = ({ className }: LogoProps) => {
	return (
		<div className={className}>
			<Image alt="Crypto" src="/img/logo.png" width={220} height={50} />
		</div>
	)
}
