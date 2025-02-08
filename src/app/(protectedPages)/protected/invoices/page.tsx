import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'Invoices' })

const InvoicesPage = () => {
	return <h1 className="text-center">Invoices</h1>
}

export default InvoicesPage
