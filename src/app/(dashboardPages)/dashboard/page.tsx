import { Metadata } from 'next'

import { fetchCoinsList } from '@/app/api/actions'

import { columns } from './_components/columns'
import { DataTable } from './_components/data-table'
import { CryptosTableSection } from './_components/crypto-table-section'
import { AccountTrendingSection } from './_components/account-trending-section'

export const metadata: Metadata = {
	title: 'Dashboard',
}

const DashboardPage = async () => {
	const data = await fetchCoinsList()

	return (
		<div className="space-y-14">
			<AccountTrendingSection />

			{/* final table */}
			<DataTable columns={columns} data={data || []} />

			<CryptosTableSection />
		</div>
	)
}

export default DashboardPage
