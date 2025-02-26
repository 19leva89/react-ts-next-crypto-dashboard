import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Billing' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const BillingPage = () => {
	return <h1 className="text-center">Billing</h1>
}

export default BillingPage
