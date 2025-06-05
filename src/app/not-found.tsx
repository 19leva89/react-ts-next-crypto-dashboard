import { constructMetadata } from '@/lib'
import { InfoBlock } from '@/components/shared/info-block'

export const metadata = constructMetadata({ title: 'Page not found' })

const NotFoundPage = () => {
	return (
		<div className='flex min-h-screen w-full items-center justify-center'>
			<InfoBlock
				type='not-found'
				title='Page not found'
				text='Please check the address entered is correct or try again later'
				imageUrl='/img/not-found.png'
			/>
		</div>
	)
}

export default NotFoundPage
