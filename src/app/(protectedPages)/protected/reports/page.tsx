import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Reports' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ReportsPage = () => {
	return <h1 className="text-center">Reports</h1>
}

export default ReportsPage
