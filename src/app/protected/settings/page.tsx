import { auth } from '@/auth'

import { ProfileForm } from './_components/profile-form'

export default async function ProfilePage() {
	const session = await auth()

	return <ProfileForm data={session?.user} />
}
