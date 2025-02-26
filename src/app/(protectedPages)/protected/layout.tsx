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
				<div className="flex flex-col gap-8">
					<Navbar />

					<div className="mx-16 max-[1200px]:mx-10 max-[800px]:mx-6 max-[600px]:mx-2">{children}</div>
				</div>

				<Footer />
			</main>
		</SidebarProvider>
	)
}
