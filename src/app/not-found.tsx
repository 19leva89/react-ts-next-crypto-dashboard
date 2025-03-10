import { constructMetadata } from '@/lib'
import { InfoBlock } from '@/components/shared/info-block'

export const metadata = constructMetadata({ title: 'Page not found' })

const NotFoundPage = () => {
	return (
		<div className="flex items-center justify-center min-h-screen w-full">
			<InfoBlock
				title="Page not found"
				text="Please check the address entered is correct or try again later"
				imageUrl="/img/not-found.png"
			/>
		</div>
	)
}

export default NotFoundPage
