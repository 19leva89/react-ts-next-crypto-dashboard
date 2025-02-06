import { Metadata } from 'next'

import { ActivitiesContainer } from './_components/activities-container'

export const metadata: Metadata = {
	title: 'Activities',
}

const ActivitiesPage = async () => {
	return <ActivitiesContainer />
}

export default ActivitiesPage
