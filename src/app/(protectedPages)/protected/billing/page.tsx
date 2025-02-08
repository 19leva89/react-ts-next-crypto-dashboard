import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Billing' })

const BillingPage = () => {
	return <h1 className="text-center">Billing</h1>
}

export default BillingPage
