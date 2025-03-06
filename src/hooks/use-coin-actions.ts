import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export const useCoinActions = () => {
	const router = useRouter()

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

			toast.success(successMessage)

			return true
		} catch (error) {
			console.error(errorMessage, error)

			toast.error(error instanceof Error ? error.message : errorMessage)

			return false
		}
	}

	return { handleAction }
}
