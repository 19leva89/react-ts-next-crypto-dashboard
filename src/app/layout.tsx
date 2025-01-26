import { Nunito } from 'next/font/google'
import { PropsWithChildren } from 'react'

import { constructMetadata } from '@/lib/utils'
import { AppProvider, ThemeProvider } from '@/components/shared/providers'

import './globals.css'

const nunito = Nunito({
	subsets: ['cyrillic'],
	variable: '--font-nunito',
	weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata = constructMetadata()

export default async function RootLayout({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body className={nunito.variable}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<AppProvider>{children}</AppProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
