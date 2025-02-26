import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Help center' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const HelpCenterPage = () => {
	return <h1 className="text-center">Help center</h1>
}

export default HelpCenterPage
