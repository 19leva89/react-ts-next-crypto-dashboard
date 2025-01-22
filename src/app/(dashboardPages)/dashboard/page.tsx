import { Metadata } from 'next'

import CryptosTableSection from './cryptoTableSection'
import AccountTrendingSection from './accountTrendingSection'

export const metadata: Metadata = {
	title: 'Dashboard',
}

export default function DashboardPage() {
	return (
		<>
			<AccountTrendingSection />

			<CryptosTableSection />
		</>
	)
}
