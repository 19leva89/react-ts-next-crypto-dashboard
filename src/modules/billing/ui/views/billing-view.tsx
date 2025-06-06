'use client'

import { ErrorState, LoadingState } from '@/components/shared'

export const BillingView = () => {
	return <h1 className='text-center'>Billing</h1>
}

export const BillingViewLoading = () => {
	return <LoadingState title='Loading billing' description='This may take a few seconds' />
}

export const BillingViewError = () => {
	return <ErrorState title='Failed to load billing' description='Please try again later' />
}
