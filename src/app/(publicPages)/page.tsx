import { Suspense } from 'react'

import DashboardPage from './dashboard/page'
import { DashboardViewLoading } from '@/modules/dashboard/ui/views/dashboard-view'

const HomePage = () => {
	return (
		<Suspense fallback={<DashboardViewLoading />}>
			<DashboardPage />
		</Suspense>
	)
}

export default HomePage
