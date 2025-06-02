import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Cards' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const CardsPage = () => {
	return <h1 className='text-center'>Cards</h1>
}

export default CardsPage
