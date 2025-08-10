import { constructMetadata } from '@/lib'
import { InfoBlock } from '@/components/shared'

export const metadata = constructMetadata({ title: 'Access denied' })

const UnauthorizedPage = () => {
	return (
		<div className='flex min-h-screen w-full items-center justify-center'>
			<InfoBlock
				type='auth'
				title='Access denied'
				text='This page can only be viewed by authorized users'
				imageUrl='/img/lock.png'
			/>
		</div>
	)
}

export default UnauthorizedPage
