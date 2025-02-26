import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Charts' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ChartsPage = () => {
	return <h1 className="text-center">ChartsPage</h1>
}

export default ChartsPage
