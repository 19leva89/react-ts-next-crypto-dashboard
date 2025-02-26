import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Notifications' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const NotificationsPage = () => {
	return <h1 className="text-center">Notifications</h1>
}

export default NotificationsPage
