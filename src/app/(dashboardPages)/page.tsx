import { Metadata } from 'next'

import DashboardPage from './dashboard/page'

export const metadata: Metadata = {
	title: 'Dashboard',
}

const HomePage = () => {
	return <DashboardPage />
}

export default HomePage
