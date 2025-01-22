import Image from 'next/image'

import logo from '@/assets/images/logo.png'

export default function Logo({ className }: { className?: string }) {
	return (
		<div className={className}>
			<Image alt="Tokena" src={logo} />
		</div>
	)
}
