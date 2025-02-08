import { constructMetadata } from '@/lib'
import { InfoBlock } from '@/components/shared'

export const metadata = constructMetadata({ title: 'Access denied' })

const UnauthorizedPage = () => {
	return (
		<div className="flex flex-col items-center justify-center mt-40">
			<InfoBlock
				title="Access denied"
				text="This page can only be viewed by authorized users"
				imageUrl="/img/lock.png"
			/>
		</div>
	)
}

export default UnauthorizedPage
