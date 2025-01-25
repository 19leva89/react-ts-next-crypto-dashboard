import { PropsWithChildren } from 'react'

import { constructMetadata } from '@/lib/utils'
import { Providers } from '@/components/shared/providers'

import './globals.css'

export const metadata = constructMetadata()

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	)
}
