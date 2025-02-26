import { auth } from '@/auth'

import { constructMetadata } from '@/lib'
import { ProfileForm } from './_components/profile-form'

export const metadata = constructMetadata({ title: 'Settings' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const SettingsPage = async () => {
	const session = await auth()

	return <ProfileForm data={session?.user} />
}

export default SettingsPage
