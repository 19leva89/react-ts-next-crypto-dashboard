import { useRouter } from 'next/navigation'

import { useToast } from '@/hooks'

export const useCoinActions = () => {
	const router = useRouter()

	const { toast } = useToast()

	const handleAction = async (
		action: () => Promise<void>,
		successMessage: string,
		errorMessage: string,
		shouldRefresh: boolean,
	) => {
		try {
			await action()

			if (shouldRefresh) {
				router.refresh()
			}

			toast({ title: '✅ Success', description: successMessage })

			return true
		} catch (error) {
			console.error(errorMessage, error)

			toast({
				title: '🚨 Error',
				description: error instanceof Error ? error.message : errorMessage,
				variant: 'destructive',
			})

			return false
		}
	}

	return { handleAction }
}
