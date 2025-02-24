import { useRouter } from 'next/navigation'

import { useToast } from '@/hooks'

export const useCoinActions = () => {
	const router = useRouter()

	const { toast } = useToast()

	const handleAction = async (action: () => Promise<void>, successMessage: string, errorMessage: string) => {
		try {
			await action()

			toast({ title: '✅ Success', description: successMessage })

			router.refresh()

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
