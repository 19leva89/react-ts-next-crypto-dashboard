import { Metadata } from 'next'

import { DataTableSection } from './_components/data-table-section'
import { AccountTrendingSection } from './_components/account-trending-section'

export const metadata: Metadata = {
	title: 'Dashboard',
}

const DashboardPage = async () => {
	return (
		<div className="space-y-14">
			<AccountTrendingSection />

			<DataTableSection />
		</div>
	)
}

export default DashboardPage
