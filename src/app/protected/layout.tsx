import { cookies } from 'next/headers'
import { PropsWithChildren } from 'react'

import { SidebarProvider } from '@/components/ui'
import { SidebarApp, Footer, Navbar } from '@/components/shared'

export default async function DashboardLayout({ children }: PropsWithChildren) {
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<SidebarApp />

			<main className="flex flex-col justify-between gap-4 min-h-screen mb-10 w-full">
				<>
					<Navbar />

					<div className="flex-grow px-4 sm:px-6 mt-8 max-w-expand mx-auto">{children}</div>
				</>

				<Footer />
			</main>
		</SidebarProvider>
	)
}
