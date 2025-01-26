import { Metadata } from 'next'

import { CryptosTableSection } from './_components/crypto-table-section'
import { AccountTrendingSection } from './_components/account-trending-section'

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
