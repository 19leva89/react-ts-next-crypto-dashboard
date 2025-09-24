import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui'
import { useTRPC } from '@/trpc/client'
import { TUserCoinData } from '@/modules/coins/schema'

interface Props {
	coin: TUserCoinData
	isOpen: boolean
	onClose: () => void
}

export const DeleteCoin = ({ coin, isOpen, onClose }: Props) => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const deleteCoinMutation = useMutation(
		trpc.coins.deleteCoinFromUser.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.coins.getUserCoins.queryOptions())

				toast.success('Coin removed successfully')

				onClose()
			},
			onError: (error) => {
				console.error('Failed to remove coin:', error)
				toast.error('Failed to remove coin')
			},
		}),
	)

	const handleDelete = async () => {
		await deleteCoinMutation.mutateAsync(coin.coinId)
	}

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className='rounded-xl px-8'>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {coin.name}?</AlertDialogTitle>

					<AlertDialogDescription>
						This action cannot be undone. Are you sure you want to delete this coin from your portfolio?
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className='gap-3'>
					<AlertDialogCancel disabled={deleteCoinMutation.isPending} className='rounded-xl'>
						Cancel
					</AlertDialogCancel>

					<AlertDialogAction
						onClick={handleDelete}
						disabled={deleteCoinMutation.isPending}
						className='rounded-xl'
					>
						{deleteCoinMutation.isPending ? 'Deleting...' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
