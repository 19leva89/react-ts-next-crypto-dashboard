import { Nunito } from 'next/font/google'
import { PropsWithChildren } from 'react'

import { Toaster } from '@/components/ui'
import { constructMetadata } from '@/lib'
import { AppLayout } from '@/components/shared/app-layout'
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
		<html lang='en' suppressHydrationWarning>
			<body className={nunito.variable}>
				<AppProvider>
					<ThemeProvider
						attribute='class'
						defaultTheme='light'
						enableSystem={false}
						disableTransitionOnChange
					>
						<AppLayout>{children}</AppLayout>
					</ThemeProvider>
				</AppProvider>

				<Toaster position='bottom-right' expand={false} richColors />
			</body>
		</html>
	)
}
