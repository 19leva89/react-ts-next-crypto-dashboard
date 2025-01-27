import { Metadata } from 'next'

import { CryptosTableSection } from './_components/crypto-table-section'
import { AccountTrendingSection } from './_components/account-trending-section'
import { columns, CryptoTableSection } from './_components/columns'
import { DataTable } from './_components/data-table'

export const metadata: Metadata = {
	title: 'Dashboard',
}

async function getData(): Promise<CryptoTableSection[]> {
	// Fetch data from your API here.
	return [
		{
			id: 1,
			coin: 'Bitcoin',
			price: 10000,
			lastDay: 20000,
			lastDayVolume: 30000,
			marketCap: 40000,
			lastSevenDays: '50000',
		},
		{
			id: 2,
			coin: 'Ethereum',
			price: 50000,
			lastDay: 60000,
			lastDayVolume: 70000,
			marketCap: 80000,
			lastSevenDays: '50000',
		},
	]
}

const DashboardPage = async () => {
	const data = await getData()

	return (
		<div className="space-y-14">
			<AccountTrendingSection />

			{/* funal table */}
			<DataTable columns={columns} data={data} />

			<CryptosTableSection />
		</div>
	)
}

export default DashboardPage
