import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Help center' })

const HelpCenterPage = () => {
	return <h1 className="text-center">Help center</h1>
}

export default HelpCenterPage
