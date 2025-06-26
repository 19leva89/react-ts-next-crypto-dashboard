import { cookies } from 'next/headers'
import { type PropsWithChildren } from 'react'

import { auth } from '@/auth'
import { firstSection, secondSection } from '@/constants/menu'
import { SidebarInset, SidebarProvider } from '@/components/ui'
import { SidebarApp, Footer, Navbar } from '@/components/shared'

export const AppLayout = async ({ children }: PropsWithChildren) => {
	const session = await auth()
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true'

	const filteredFirstSection = firstSection.filter((item) => !item.private || !!session)
	const filteredSecondSection = secondSection.filter((item) => !item.private || !!session)

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<SidebarApp firstSection={filteredFirstSection} secondSection={filteredSecondSection} />

			<SidebarInset className='justify-between gap-10 overflow-hidden'>
				<div className='flex flex-col gap-8'>
					<Navbar />

					<div className='container'>{children}</div>
				</div>

				<Footer />
			</SidebarInset>
		</SidebarProvider>
	)
}
