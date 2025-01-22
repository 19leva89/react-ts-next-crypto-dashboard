import { Metadata } from 'next'

import { CryptosTableSection } from './crypto-table-section'
import { AccountTrendingSection } from './account-trending-section'

export const metadata: Metadata = {
	title: 'Dashboard',
}

const DashboardPage = () => {
	return (
		<>
			<AccountTrendingSection />

			<CryptosTableSection />
		</>
	)
}

export default DashboardPage
