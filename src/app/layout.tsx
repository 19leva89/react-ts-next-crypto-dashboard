import { Nunito } from 'next/font/google'
import { PropsWithChildren } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

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

/**
 * Root layout component for the Next.js application
 * Sets up global providers, theme configuration, and font styling
 * @param props - Component props
 * @param props.children - Child components to render within the layout
 * @returns JSX element with HTML structure and global providers
 */
async function RootLayout({ children }: PropsWithChildren) {
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

				{/* Allow track page views for Vercel */}
				<Analytics />

				{/* Automatically tracks web vitals and other performance metrics for Vercel */}
				<SpeedInsights />
			</body>
		</html>
	)
}

export default RootLayout
