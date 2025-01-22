import { PropsWithChildren } from 'react'

import { constructMetadata } from '@/lib/utils'
import './globals.css'

export const metadata = constructMetadata()

export default async function RootLayout({ children }: PropsWithChildren) {
	return children
}
