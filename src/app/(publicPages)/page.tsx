import { Metadata } from 'next'

import DashboardPage from './dashboard/page'

export const metadata: Metadata = {
	title: 'Dashboard',
}

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const HomePage = () => {
	return <DashboardPage />
}

export default HomePage
