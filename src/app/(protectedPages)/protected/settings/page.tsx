import { auth } from '@/auth'

import { ProfileForm } from './_components/profile-form'

const SettingsPage = async () => {
	const session = await auth()

	return <ProfileForm data={session?.user} />
}

export default SettingsPage
