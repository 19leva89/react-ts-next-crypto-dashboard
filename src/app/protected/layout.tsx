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

					<div className="flex px-4 h-full">{children}</div>
				</>

				<Footer />
			</main>
		</SidebarProvider>
	)
}
